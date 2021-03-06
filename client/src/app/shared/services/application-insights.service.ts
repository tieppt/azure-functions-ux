import { Injectable, Injector } from '@angular/core';
import { Response } from '@angular/http';
import { AIMonthlySummary, AIInvocationTrace, AIInvocationTraceHistory } from '../models/application-insights';
import { Observable } from 'rxjs/Observable';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { HttpResult } from './../models/http-result';
import { CacheService } from './cache.service';
import { LogService } from './log.service';
import { LogCategories, Constants } from '../models/constants';
import { ArmSiteDescriptor } from '../resourceDescriptors';
import * as pako from 'pako';

@Injectable()
export class ApplicationInsightsService {
  private readonly _client: ConditionalHttpClient;

  private readonly _apiVersion: string = '2015-05-01';
  private readonly _directUrl: string = 'https://analytics.applicationinsights.io/';

  constructor(
    private _logService: LogService,
    private _cacheService: CacheService,
    userService: UserService,
    injector: Injector
  ) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getLast30DaysSummary(aiResourceId: string, functionName: string): Observable<AIMonthlySummary> {
    this._validateAiResourceid(aiResourceId);

    const body = {
      'query': this._getQueryForLast30DaysSummary(functionName)
    };

    const armResponse = this._cacheService.postArm(`/${aiResourceId}/api/query`, true, this._apiVersion, body, 'applicationInsights_30DaysSummary');

    return this._client
      .execute({ resourceId: aiResourceId}, t => armResponse)
      .map(response => this._extractSummaryFromResponse(response));
  }

  public getInvocationTraces(aiResourceId: string, functionName: string, top: number = 20): Observable<AIInvocationTrace[]> {
    this._validateAiResourceid(aiResourceId);

    const body = {
      'query': this._getQueryForInvocationTraces(functionName, top)
    };

    const armResponse = this._cacheService.postArm(`/${aiResourceId}/api/query`, true, this._apiVersion, body, 'applicationInsights_invocationTraces');

    return this._client
      .execute({resourceId: aiResourceId}, t => armResponse)
      .map(response => this._extractInvocationTracesFromResponse(response));
  }

  public getInvocationTraceHistory(aiResourceId: string, operationId: string): Observable<AIInvocationTraceHistory[]> {
    this._validateAiResourceid(aiResourceId);

    const body = {
      'query': this._getQueryForInvocationTraceHistory(operationId)
    };

    const armResponse = this._cacheService.postArm(`/${aiResourceId}/api/query`, true, this._apiVersion, body, 'applicationInsights_invocationTraceHistory');

    return this._client
      .execute({resourceId: aiResourceId}, t => armResponse)
      .map(response => this._extractInvocationTraceHistoryFromResponse(response));
  }

  public getInvocationTracesDirectUrl(aiDirectResourceId: string, functionName: string, top: number = 20): string {
    const baseUrl = this._directUrl + aiDirectResourceId + '?q=';
    const query = ApplicationInsightsQueryUtil.compressAndEncodeBase64AndUri(this._getQueryForInvocationTraces(functionName, top));
    return baseUrl + query;
  }

  public getInvocationTraceHistoryDirectUrl(aiDirectResourceId: string, operationId: string): string {
    const baseUrl = this._directUrl + aiDirectResourceId + '?q=';
    const query = ApplicationInsightsQueryUtil.compressAndEncodeBase64AndUri(this._getQueryForInvocationTraceHistory(operationId));
    return baseUrl + query;
  }

  public getApplicationInsightsId(siteId: string): Observable<string> {
      const descriptor = new ArmSiteDescriptor(siteId);
      return Observable.zip(
          this._cacheService.postArm(`${siteId}/config/appsettings/list`),
          this._cacheService.getArm(`/subscriptions/${descriptor.subscription}/providers/microsoft.insights/components`, false, '2015-05-01'),
          (as, ai) => ({ appSettings: as, appInsights: ai }))
          .map(r => {
              const ikey = r.appSettings.json().properties[Constants.instrumentationKeySettingName];
              let result = null;
              if (ikey) {
                  const aiResources = r.appInsights.json();

                  // AI RP has an issue where they return an array instead of a JSON response if empty
                  if (aiResources && !Array.isArray(aiResources)) {
                      aiResources.value.forEach((ai) => {
                          if (ai.properties.InstrumentationKey === ikey) {
                              result = ai.id;
                          }
                      });
                  }
              }
              return result;
          });
  }

  private _getQueryForLast30DaysSummary(functionName: string): string {
    this._validateFunctionName(functionName);
    return `requests | where timestamp >= ago(30d) | where name == '${functionName}' | summarize count=count() by success`;
  }

  private _getQueryForInvocationTraces(functionName: string, top: number): string {
    this._validateFunctionName(functionName);
    return `requests | project timestamp, id, name, success, resultCode, duration, operation_Id | where timestamp > ago(30d) | where name == '${functionName}' | order by timestamp desc | take ${top}`;
  }

  private _getQueryForInvocationTraceHistory(operationId: string): string {
    this._validateOperationId(operationId);

    return `let dataset=traces ` +
    `| where timestamp > ago(30d) ` +
    `| where operation_Id == '${operationId}'; ` +
    `dataset ` +
    `| sort by timestamp asc ` +
    `| project message, itemCount, logLevel = customDimensions.LogLevel `;
  }

  private _validateAiResourceid(aiResourceId: string): void {
    if (!aiResourceId) {
      throw Error('aiResourceId is required.');
    }
  }

  private _validateFunctionName(functionName: string): void {
    if (!functionName) {
      throw Error('functionName is required.');
    }
  }

  private _validateOperationId(operationId: string): void {
    if (!operationId) {
      throw Error('operationId is required.');
    }
  }

  private _extractSummaryFromResponse(response: HttpResult<Response>): AIMonthlySummary {
    const summary: AIMonthlySummary = {
      successCount: 0,
      failedCount: 0
    };

    if (response.isSuccessful) {
      const summaryTable = response.result.json().Tables[0];
      const rows = summaryTable.Rows;
      if (rows.length <= 2) {
        rows.forEach(element => {
          if (element[0] === 'True') {
            summary.successCount = element[1];
          } else if (element[0] === 'False') {
            summary.failedCount = element[1];
          }
        });
      }
    } else {
      this._logService.error(LogCategories.applicationInsightsQuery, '/summary', response.error);
    }

    return summary;
  }

  private _extractInvocationTracesFromResponse(response: HttpResult<Response>): AIInvocationTrace[] {
    const traces: AIInvocationTrace[] = [];

    if (response.isSuccessful) {
      const summaryTable = response.result.json().Tables[0];
      if (summaryTable && summaryTable.Rows.length > 0) {
        summaryTable.Rows.forEach(row => {
          traces.push({
            timestamp: row[0],
            id: row[1],
            name: row[2],
            success: row[3],
            resultCode: row[4],
            duration: Number.parseFloat(row[5]),
            operationId: row[6]
          });
        });
      }
    } else {
      this._logService.error(LogCategories.applicationInsightsQuery, '/invocationTraces', response.error);
    }

    return traces;
  }

  private _extractInvocationTraceHistoryFromResponse(response: HttpResult<Response>): AIInvocationTraceHistory[] {
    const history: AIInvocationTraceHistory[] = [];

    if (response.isSuccessful) {
      const summaryTable = response.result.json().Tables[0];
      if (summaryTable && summaryTable.Rows.length > 0) {
        summaryTable.Rows.forEach(row => {
          history.push({
            message: row[0],
            itemCount: row[1],
            logLevel: row[2]
          });
        });
      }
    } else {
      this._logService.error(LogCategories.applicationInsightsQuery, '/invocationTraceDetail', response.error);
    }

    return history;
  }

}

class ApplicationInsightsQueryUtil {
  public static compressAndEncodeBase64AndUri(str) {
      const compressedBase64 = ApplicationInsightsQueryUtil._compressAndEncodeBase64(str);
      return encodeURIComponent(compressedBase64);
  }

  public static decompressBase64UriComponent(compressedBase64UriComponent) {
      const compressedBase64 = decodeURIComponent(compressedBase64UriComponent);

      return ApplicationInsightsQueryUtil._decompressBase64(compressedBase64);
  }

  private static _compressAndEncodeBase64(str) {
      const compressed = ApplicationInsightsQueryUtil._compressString(str);
      return btoa(compressed);
  }

  private static _compressString(str) {
      const byteArray = ApplicationInsightsQueryUtil._toUTF8Array(str);
      const compressedByteArray = pako.gzip(byteArray);
      const compressed = String.fromCharCode.apply(null, compressedByteArray);

      return compressed;
  }

  private static _decompressBase64(compressedBase64) {
      const compressed = atob(compressedBase64);

      return ApplicationInsightsQueryUtil._decompressString(compressed);
  }

  private static _decompressString(compressed) {
      const compressedByteArray = compressed.split('').map(function (e) {
          return e.charCodeAt(0);
      });
      const decompressedByteArray = pako.inflate(compressedByteArray);
      const decompressed = ApplicationInsightsQueryUtil._fromUTF8Array(decompressedByteArray);

      return decompressed;
  }

  private static _toUTF8Array(str) {
      const utf8 = [];
      for (let i=0; i < str.length; i++) {
          let charcode = str.charCodeAt(i);
          if (charcode < 0x80) utf8.push(charcode);
          else if (charcode < 0x800) {
              utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
          }
          else if (charcode < 0xd800 || charcode >= 0xe000) {
              utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
          }
          else {
              i++;
              charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
              utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
          }
      }
      return utf8;
  }

  private static _fromUTF8Array(utf8) {
      const charsArray = [];
      for (let i = 0; i < utf8.length; i++) {
          let charCode, firstByte, secondByte, thirdByte, fourthByte;
          if ((utf8[i] & 0x80) === 0) {
              charCode = utf8[i];
          }
          else if ((utf8[i] & 0xE0) === 0xC0) {
              firstByte = utf8[i] & 0x1F;
              secondByte = utf8[++i] & 0x3F;
              charCode = (firstByte << 6) + secondByte;
          }
          else if ((utf8[i] & 0xF0) === 0xE0) {
              firstByte = utf8[i] & 0x0F;
              secondByte = utf8[++i] & 0x3F;
              thirdByte = utf8[++i] & 0x3F;
              charCode = (firstByte << 12) + (secondByte << 6) + thirdByte;
          }
          else if ((utf8[i] & 0xF8) === 0xF0) {
              firstByte = utf8[i] & 0x07;
              secondByte = utf8[++i] & 0x3F;
              thirdByte = utf8[++i] & 0x3F;
              fourthByte = utf8[++i] & 0x3F;
              charCode = (firstByte << 18) + (secondByte << 12) + (thirdByte << 6) + fourthByte;
          }

          charsArray.push(charCode);
      }
      return String.fromCharCode.apply(null, charsArray);
  }
}
