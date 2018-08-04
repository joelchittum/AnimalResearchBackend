"use strict";

var config = {
  cors: {
    enabled: true
  },

  cron: {
    reset: "0 * * * *"
  },

  /**
   * This object defines the ext direct communication.
   */
  direct: {
    rootNamespace: "researchNodeServer",
    apiName: "RESEARCHAPI",
    apiUrl: "/nodeserver",
    classRouteUrl: "/nodeserver",
    classPath: "nodeserver",
    server: process.env.NAMESPACE,
    protocol: process.env.PROTOCOL,
    port: process.env.PORT,
    timeout: 30000,
    cacheAPI: false,
    relativeUrl: false
  },

  /**
   * This object sets up everything needed to use couchbase with the
   * SDK for node js.
   */
  database: {
    endPoint: process.env.COUCHSERVICE + ":8091",
    n1qlService: process.env.COUCHSERVICE + ":8093",
    ftsService: process.env.COUCHSERVICE + ":8094",
    hostName: process.env.COUCHSERVICE,
    bucket: process.env.ANIMALBUCKET,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    dataPath: "",
    indexPath: "",
    indexType: "gsi",
    indexerStorageMode: "forestdb",
    showQuery: false,
    indexMemQuota: 512,
    dataMemQuota: 256,
    ftsMemoryQuota: 256,
    thresholdItemCount: 31565,

    ftsIndex: {
      type: "fulltext-index",
      name: process.env.ANIMALBUCKET,
      sourceType: "couchbase",
      sourceName: process.env.ANIMALBUCKET,

      planParams: {
        maxPartitionsPerPIndex: 32,
        numReplicas: 0,
        hierarchyRules: null,
        nodePlanParams: null,
        pindexWeights: null,
        planFrozen: false
      },

      params: {
        mapping: {
          default_analyzer: "standard",
          default_datetime_parser: "dateTimeOptional",
          default_field: "_all",

          default_mapping: {
            display_order: "1",
            dynamic: true,
            enabled: false
          },

          default_type: "_default",
          index_dynamic: true,
          store_dynamic: false,
          type_field: "type",
          types: {}
        },

        store: {
          kvStoreName: "forestdb"
        }
      },

      sourceParams: {
        clusterManagerBackoffFactor: 0,
        clusterManagerSleepInitMS: 0,
        clusterManagerSleepMaxMS: 2000,
        dataManagerBackoffFactor: 0,
        dataManagerSleepInitMS: 0,
        dataManagerSleepMaxMS: 2000,
        feedBufferAckThreshold: 0,
        feedBufferSizeBytes: 0
      }
    }
  },

  session: {
    secret: "62P59nE68F38q0q2wvHho58oR38aY7U9",
    duration: 86400,
    readonly: false
  }
};

module.exports = config;
