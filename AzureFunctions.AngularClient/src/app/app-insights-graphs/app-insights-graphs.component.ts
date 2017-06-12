import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Query } from './../shared/models/ux-settings';
import { AppInsightsResponse } from './../shared/models/app-insights-response';
import { Observable } from 'rxjs/Observable';
import { UxSettingsService } from './../shared/services/ux-settings.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/combineLatest';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { Component, OnInit, Input } from '@angular/core';
declare let pako: any;

interface Graph {
  data?: Observable<AppInsightsResponse>;
  query: Query;
}

@Component({
  selector: 'app-insights-graphs',
  templateUrl: './app-insights-graphs.component.html',
  styleUrls: ['./app-insights-graphs.component.scss']
})
export class AppInsightsGraphsComponent {
  public graphs: Graph[];
  public editingGraph: Graph;
  public newContent: string;

  private armIdStream: Subject<string>;
  private functionNameStream: BehaviorSubject<string>;
  private appInsightsConfig: { apiKey: string, appId: string };
  private currentArmId: string;
  private currentFunctionName: string;

  constructor(private _uxSettingsService: UxSettingsService) {
    this.armIdStream = new Subject<string>();
    this.functionNameStream = new BehaviorSubject<string>(null);

    Observable.combineLatest(this.armIdStream, this.functionNameStream, (x, y, z) => ({ armId: x, functionName: y }))
      .debounceTime(50)
      .do(data => {
        this.currentArmId = data.armId;
        this.currentFunctionName = data.functionName;
        this.appInsightsConfig = null;
      })
      .switchMap(data => Observable.zip(
          _uxSettingsService.getAppInsightsConfig(data.armId),
          _uxSettingsService.getQueries(data.armId, data.functionName))
      )
      .do(null, () => {
        // log error
      })
      .retry()
      .subscribe(result => {
        const appInsightsConfig = result[0];
        const queries = result[1];
        this.appInsightsConfig = appInsightsConfig;
        this.graphs = queries.map(q => ({ data: this._uxSettingsService.getQueryData(appInsightsConfig, q), query: q }));
      });
  }

  @Input() set armId(value: string) {
    if (value) {
      this.armIdStream.next(value);
    }
  }

  @Input() set functionName(value: string) {
    if (value) {
      this.functionNameStream.next(value);
    }
  }

  onAddGraphClick() {
    this.editingGraph = {
      query: {
        value: ''
      }
    };
    this.newContent = null;
  }

  hideModal() {
    if (this.newContent == null || this.editingGraph.query.value === this.newContent || confirm('Your stuff will be lost?')) {
      this.newContent = null;
      this.editingGraph = null;
    }
  }

  createOrUpdateGraph() {
    if (this.editingGraph.query.value !== this.newContent) {
        this.editingGraph.query.value = this.newContent;
        this._uxSettingsService.addOrUpdateQuery(this.currentArmId, this.editingGraph.query, this.currentFunctionName)
          .subscribe(q => {
            const existingQuery = this.graphs.find(g => g.query.id === q.id);
            if (existingQuery) {
              existingQuery.query = q;
              existingQuery.data = this._uxSettingsService.getQueryData(this.appInsightsConfig, q);
            } else {
              this.graphs.push({ query: q, data: this._uxSettingsService.getQueryData(this.appInsightsConfig, q) });
            }
          });
    }
    this.hideModal();
  }

  deleteGraph(graph: Graph) {
    if (confirm('Are you sure you want to delete the chart?')) {
      this._uxSettingsService.deleteQuery(this.currentArmId, graph.query, this.currentFunctionName)
        .subscribe(() => {
          const index = this.graphs.findIndex((g) => g.query.id === graph.query.id);
          if (index > -1) {
            this.graphs.splice(index, 1);
          }
        });
    }
  }

  editGraph(graph: Graph) {
    // TODO: Fix
    const clone: Query = JSON.parse(JSON.stringify(graph.query));
    this.editingGraph = {
      query: clone
    };
    this.runQuery(clone.value);
  }


  runQuery(value: string) {
    this.editingGraph.data = this._uxSettingsService.getQueryData(this.appInsightsConfig, { value: value });
  }

  openAppInsights() {
    const url = 'https://analytics.applicationinsights.io/subscriptions/2d41f884-3a5d-4b75-809c-7495edb04a0f/resourcegroups/HackathonFunctionApp/components/HackathonFunctionApp?q=';
    const query = Util.compressAndEncodeBase64AndUri(this.newContent || this.editingGraph.query.value);
    window.open(url + query,  '_blank');
  }
}

class Util {
    static compressAndEncodeBase64AndUri(str) {
        var compressedBase64 = Util.compressAndEncodeBase64(str);
        return encodeURIComponent(compressedBase64);
    }

    static compressAndEncodeBase64(str) {
        var compressed = Util.compressString(str);
        return btoa(compressed);
    }
    static compressString(str) {
        var byteArray = Util.toUTF8Array(str);
        var compressedByteArray = pako.gzip(byteArray);
        var compressed = String.fromCharCode.apply(null, compressedByteArray);

        return compressed;
    }
    static decompressBase64UriComponent(compressedBase64UriComponent) {
        var compressedBase64 = decodeURIComponent(compressedBase64UriComponent);

        return Util.decompressBase64(compressedBase64);
    }
    static decompressBase64(compressedBase64) {
        var compressed = atob(compressedBase64);

        return Util.decompressString(compressed);
    }
    static decompressString(compressed) {
        var compressedByteArray = compressed.split('').map(function (e) {
            return e.charCodeAt(0);
        });
        var decompressedByteArray = pako.inflate(compressedByteArray);
        var decompressed = Util.fromUTF8Array(decompressedByteArray);

        return decompressed;
    }
    static toUTF8Array(str) {
        var utf8 = [];
        for (var i=0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
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
    static fromUTF8Array(utf8) {
        var charsArray = [];
        for (var i = 0; i < utf8.length; i++) {
            var charCode, firstByte, secondByte, thirdByte, fourthByte;
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