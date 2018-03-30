import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { ArmService } from './arm.service';
import { AIMonthlySummary, AIInvocationTrace } from '../models/application-insights';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApplicationInsightsService {

  private readonly _apiVersion: string = "2014-12-01-preview";

  constructor(
    private _armService: ArmService
  ) { }

  public getCurrentMonthSummary(aiResourceId: string, functionName: string): Observable<AIMonthlySummary> {
    this._validateAiResourceid(aiResourceId);
    this._validateFunctionName(functionName);

    var today = new Date();
    var startDate = `${today.getFullYear()}-${today.getMonth() + 1}-1`;

    const resourceId = `${aiResourceId}/api/query`;
    const query = `requests | where timestamp >= datetime('${startDate}') | where name == '${functionName}' | summarize count=count() by success`;
    const body = {
      'query': query
    };

    return this._armService
      .post(resourceId, body, this._apiVersion)
      .map(response => this._extractSummaryFromResponse(response));
  }

  public getInvocationData(aiResourceId: string, functionName: string, top: number = 20): Observable<AIInvocationTrace[]> {
    this._validateAiResourceid(aiResourceId);
    this._validateFunctionName(functionName);

    const resourceId = `${aiResourceId}/api/query`;
    const query = `requests | project timestamp, id, name, success, resultCode, duration, operation_Id | where name == '${functionName}' | order by timestamp desc | take ${top}`;
    const body = {
      'query': query
    };

    return this._armService
      .post(resourceId, body, this._apiVersion)
      .map(response => this._extractInvocationDataFromResponse(response));
  }

  private _validateAiResourceid(aiResourceId: string): void {
    if (!aiResourceId) {
      throw "aiResourceId is required.";
    }
  }

  private _validateFunctionName(functionName: string): void {
    if (!functionName) {
      throw "functionName is required.";
    }
  }

  private _extractSummaryFromResponse(response: Response): AIMonthlySummary {
    var summary: AIMonthlySummary = {
      successCount: 0,
      failedCount: 0
    };

    if (response.ok) {
      var summaryTable = response.json().Tables[0];
      var rows = summaryTable.Rows;
      if (rows.length <= 2) {
        rows.forEach(element => {
          if (element[0] === "True") {
            summary.successCount = element[1];
          } else if (element[0] === "False") {
            summary.failedCount = element[1];
          }
        });
      }
    }

    return summary;
  }

  private _extractInvocationDataFromResponse(response: Response): AIInvocationTrace[] {
    var traces: AIInvocationTrace[] = [];

    if (response.ok) {
      var summaryTable = response.json().Tables[0];
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
    }

    return traces;
  }

}
