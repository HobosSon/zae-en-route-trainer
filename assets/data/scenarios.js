/*
 * Static "level" scenarios for Practice Scenarios (27 total).
 * Each entry is either null (not authored yet) or:
 *   { title, description, startTime, atis, altimeters, strips: [ { type, spaces, remoteFields }, ... ] }
 *
 * Baked into the site (same for everyone). Author them on the Practice
 * Scenarios page (Author static levels -> Save to slot -> Export static JSON)
 * and paste the export here. Authored so far: NR-11, NR-13, NR-14, NR-15, NR-16, NR-17, NR-18, NR-19, NR-20, NR-21, NR-22, NR-23, NR-24, NR-25, NR-26, NR-27.
 */
window.ZAE_STATIC_SCENARIOS = {
  "total": 27,
  "scenarios": [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    {
      "title": "NR-11",
      "description": "",
      "startTime": "0900",
      "atis": "Z",
      "altimeters": {
        "KMLU": "3004",
        "KVKS": "2999",
        "KJAN": "3001",
        "KGWO": "3001"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "G47522",
            "4": "C130/A",
            "5": "T250",
            "11": "MLU",
            "12": "0900",
            "15": "0905",
            "19": "STUEE",
            "20": "90",
            "21": "MHZ",
            "22": "0924",
            "25": "KBAD./.MLU V18 KMEI"
          },
          "remoteFields": {
            "ic": "0901"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N177RS",
            "4": "C441/G",
            "5": "T290",
            "16": "↑",
            "19": "KGWO P0907",
            "21": "MHZ",
            "23": "+14",
            "24": "140",
            "25": "KGWO SQS V9 MCB V555 PCU KGPT/0039"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N622SG",
            "4": "PA46/A",
            "5": "T230",
            "16": "↑",
            "19": "KVKS P0915",
            "21": "MLU",
            "23": "+12",
            "24": "160",
            "25": "KVKS MLU V18 EIC KSHV/0037",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N911DL",
            "4": "C414/A",
            "5": "T180",
            "11": "HEZ",
            "12": "0855",
            "15": "0922",
            "16": "↓",
            "17": "22",
            "19": "MHZ",
            "20": "90",
            "21": "KJAN",
            "22": "0927",
            "25": "KAEX V245 MHZ KJAN/0925"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "PYTHON2",
            "4": "T44/A",
            "5": "T260",
            "11": "MLU",
            "12": "0902",
            "15": "0907",
            "19": "STUEE",
            "20": "110",
            "21": "MHZ",
            "22": "0927",
            "25": "KSHV MLU V18 MHZ V245 IGB KPNS"
          },
          "remoteFields": {
            "ic": "0903"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "G47522",
            "4": "C130/A",
            "5": "T250",
            "11": "STUEE",
            "12": "0905",
            "15": "0924",
            "19": "MHZ",
            "20": "90",
            "21": "MEI",
            "22": "0941",
            "25": "KBAD./.MLU V18 KMEI"
          },
          "remoteFields": {
            "altReq": {
              "alt": "110",
              "t": "0918"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N177RS",
            "4": "C441/G",
            "5": "T290",
            "11": "KGWO",
            "12": "P0907",
            "19": "MHZ",
            "21": "MCB",
            "23": "+14",
            "24": "140",
            "25": "KGWO SQS V9 MCB V555 PCU KGPT/0039",
            "30": "ZHU",
            "14a": "+14"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "PYTHON2",
            "4": "T44/A",
            "5": "T260",
            "11": "STUEE",
            "12": "0907",
            "15": "0927",
            "19": "MHZ",
            "20": "110",
            "21": "ZAMMA",
            "22": "0938",
            "25": "KSHV MLU V18 MHZ V245 IGB KPNS"
          },
          "remoteFields": {
            "altReq": {
              "alt": "130",
              "t": "0912"
            }
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N1090Q",
            "4": "BE80/A",
            "5": "T220",
            "11": "GLH",
            "12": "0858",
            "15": "0916",
            "16": "↓",
            "19": "MHZ",
            "20": "110",
            "21": "KJVW",
            "22": "0921",
            "25": "KPBF V74 MHZ KJVW/0919"
          },
          "remoteFields": {
            "ic": "0902"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N368DC",
            "4": "AC11/A",
            "5": "T250",
            "11": "UJM",
            "12": "0855",
            "15": "0912",
            "16": "↓",
            "17": "12",
            "19": "SQS",
            "20": "130",
            "21": "KGWO",
            "22": "0919",
            "25": "KLIT./.UJM V9 SQS KGWO/0917"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N19RW",
            "4": "G159/A",
            "5": "T280",
            "11": "GLH",
            "12": "0915",
            "15": "0923",
            "19": "SQS",
            "20": "130",
            "21": "IGB",
            "22": "0940",
            "25": "KELD MON V278 IGB KSTF/0946"
          },
          "remoteFields": {
            "ic": "0919"
          }
        }
      ]
    },
    null,
    {
      "title": "NR-13",
      "description": "",
      "startTime": "2030",
      "atis": "L",
      "altimeters": {
        "KMLU": "2996",
        "KVKS": "2998",
        "KJAN": "3000",
        "KGWO": "2999"
      },
      "strips": [
        {
          "type": "departure",
          "spaces": {
            "3": "FLG615",
            "4": "SF34/A",
            "5": "T240",
            "16": "↑",
            "19": "KJAN P2049",
            "21": "HEZ",
            "23": "+20",
            "24": "160",
            "25": "KJAN MHZ V245 AEX V212 KLFK",
            "30": "ZHU"
          },
          "remoteFields": {
            "reqClnc": "2044"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N112DG",
            "4": "BE9L/A",
            "5": "T240",
            "11": "HEZ",
            "12": "2031",
            "15": "2051",
            "19": "MHZ",
            "20": "130",
            "21": "ZAMMA",
            "22": "2103",
            "25": "KAEX./.HEZ V245 IGB KTUP/2129"
          },
          "remoteFields": {
            "ic": "2033"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N233TX",
            "4": "BE55/X",
            "5": "T170",
            "11": "MLU",
            "12": "2023",
            "15": "2029",
            "17": "29",
            "18": "2029",
            "19": "STUEE",
            "20": "90",
            "21": "MHZ",
            "22": "2055",
            "25": "KPSN./.MLU V18 MHZ KJVW/2100"
          },
          "remoteFields": {
            "onFreq": true
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N306M",
            "4": "SW4/A",
            "5": "T260",
            "11": "MLU",
            "12": "2025",
            "15": "2030",
            "17": "30",
            "18": "2030",
            "19": "STUEE",
            "20": "130",
            "21": "MHZ",
            "22": "2049",
            "25": "KDAL./.MLU V18 KBHM/2131"
          },
          "remoteFields": {
            "onFreq": true
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "BE58/A",
            "5": "T160",
            "11": "MCB",
            "12": "2026",
            "15": "2050",
            "19": "MHZ",
            "20": "110",
            "21": "STUEE",
            "22": "2115",
            "25": "KMSY./.MCB V9 MHZ V18 MLU KMLU/2122"
          },
          "remoteFields": {
            "ic": "2031"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N56BT",
            "4": "BE65/A",
            "5": "T195",
            "16": "↑",
            "19": "KJAN P2053",
            "21": "MCB",
            "23": "+24",
            "24": "110",
            "25": "KJAN MHZ V9 MCB KMSY/0054",
            "30": "ZHU"
          },
          "remoteFields": {
            "reqClnc": "2048"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N39K",
            "4": "BE10/A",
            "5": "T220",
            "16": "↑",
            "19": "KVKS P2043",
            "21": "MLU",
            "23": "+17",
            "24": "80",
            "25": "KVKS MLU KSHV/0050",
            "30": "ZFW"
          },
          "remoteFields": {
            "reqClnc": "2038"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N233TX",
            "4": "BE55/X",
            "5": "T170",
            "11": "STUEE",
            "12": "2029",
            "15": "2055",
            "16": "↓",
            "17": "55",
            "19": "MHZ",
            "20": "90",
            "21": "KJVW",
            "22": "2100",
            "25": "KPSN./.MLU V18 MHZ KJVW/2100"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N306M",
            "4": "SW4/A",
            "5": "T260",
            "11": "STUEE",
            "12": "2030",
            "15": "2049",
            "17": "49",
            "19": "MHZ",
            "20": "130",
            "21": "MEI",
            "22": "2107",
            "25": "KDAL./.MLU V18 KBHM/2131"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N3492S",
            "4": "BE58/A",
            "5": "T160",
            "11": "MHZ",
            "12": "2050",
            "15": "2115",
            "16": "↓",
            "19": "STUEE",
            "20": "110",
            "21": "MLU",
            "22": "2121",
            "25": "KMSY./.MCB V9 MHZ V18 MLU KMLU/2122"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N481SH",
            "4": "PAY1/A",
            "5": "T240",
            "11": "IGB",
            "12": "2016",
            "15": "2038",
            "16": "↓",
            "19": "SQS",
            "20": "100",
            "21": "KGWO",
            "22": "2045",
            "25": "KBHM./.IGB V278 SQS KGWO/2043"
          },
          "remoteFields": {
            "ic": "2032"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N649JX",
            "4": "C441/A",
            "5": "T250",
            "11": "GLH",
            "12": "2032",
            "15": "2041",
            "19": "SQS",
            "20": "110",
            "21": "IGB",
            "22": "2103",
            "25": "KELD./.GLH V278 IGB KMGM/2134"
          },
          "remoteFields": {
            "ic": "2034"
          }
        }
      ]
    },
    {
      "title": "NR-14",
      "description": "",
      "startTime": "1830",
      "atis": "T",
      "altimeters": {
        "KMLU": "3009",
        "KVKS": "3001",
        "KJAN": "3009",
        "KGWO": "2998"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "EJA922",
            "4": "C500/A",
            "5": "T300",
            "11": "HEZ",
            "12": "1835",
            "15": "1851",
            "19": "MHZ",
            "20": "150",
            "21": "ZAMMA",
            "22": "1900",
            "25": "KAUS./.HEZ V245 IGB KBNA"
          },
          "remoteFields": {
            "ic": "1839"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "ENY3696",
            "4": "CRJ1/A",
            "5": "T410",
            "16": "↑",
            "19": "KJAN P1847",
            "21": "MCB",
            "23": "+10",
            "24": "160",
            "25": "KJAN MHZ V9 MCB KMSY",
            "30": "ZHU"
          },
          "remoteFields": {
            "reqClnc": "1842"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N200NG",
            "4": "BE55/A",
            "5": "T200",
            "11": "MLU",
            "12": "1833",
            "15": "1849",
            "16": "↓",
            "19": "DORTS",
            "20": "150",
            "21": "KVKS",
            "22": "1854",
            "25": "KAGO MLU V417 DORTS KVKS/1854"
          },
          "remoteFields": {
            "ic": "1837",
            "vksWx": false
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N315XW",
            "4": "BE9L/A",
            "5": "T250",
            "11": "GLH",
            "12": "1831",
            "15": "1851",
            "16": "↓",
            "19": "MHZ",
            "20": "90",
            "21": "KJAN",
            "22": "1901",
            "25": "KLLQ./.GLH V74 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "1833"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N463TM",
            "4": "BE9L/A",
            "5": "T250",
            "11": "MLU",
            "12": "1829",
            "15": "1834",
            "17": "34",
            "19": "STUEE",
            "20": "110",
            "21": "MHZ",
            "22": "1853",
            "25": "KADS./.MLU V18 MHZ KJAN/1856"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N689YV",
            "4": "C310/A",
            "5": "T250",
            "11": "MLU",
            "12": "1833",
            "15": "1838",
            "19": "STUEE",
            "20": "130",
            "21": "MHZ",
            "22": "1857",
            "25": "KSHV./.MLU V18 MEI KMEI/1915"
          },
          "remoteFields": {
            "ic": "1834"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "SWA139",
            "4": "B733/A",
            "5": "T420",
            "11": "HEZ",
            "12": "1844",
            "15": "1856",
            "16": "↓",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "1901",
            "25": "KHOU./.HEZ V245 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "1844"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "TUG96",
            "4": "C130/A",
            "5": "T220",
            "16": "↑",
            "19": "KJAN P1847",
            "21": "MCB",
            "23": "+19",
            "24": "160",
            "25": "KJAN MHZ V9 MCB KMSY",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N463TM",
            "4": "BE9L/A",
            "5": "T250",
            "11": "STUEE",
            "12": "1834",
            "15": "1853",
            "16": "↓",
            "19": "MHZ",
            "20": "110",
            "21": "KJAN",
            "22": "1855",
            "25": "KADS./.MLU V18 MHZ KJAN/1856"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N689YV",
            "4": "C310/A",
            "5": "T250",
            "11": "STUEE",
            "12": "1838",
            "15": "1857",
            "19": "MHZ",
            "20": "130",
            "21": "MEI",
            "22": "1915",
            "25": "KSHV./.MLU V18 MEI KMEI/1915"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N946DN",
            "4": "BE9L/A",
            "5": "T250",
            "11": "MIZZE",
            "12": "1825",
            "15": "1840",
            "19": "MHZ",
            "20": "140",
            "21": "GLH",
            "22": "1859",
            "25": "KMOB GCV V11 MHZ V74 GLH KGLH/1859"
          },
          "remoteFields": {
            "ic": "1833",
            "altReq": {
              "alt": "40",
              "t": "1845"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N101WX",
            "4": "BE55/A",
            "5": "T180",
            "11": "IGB",
            "12": "1817",
            "15": "1846",
            "19": "SQS",
            "20": "100",
            "21": "GLH",
            "22": "1858",
            "25": "KTUP IGB V278 GLH KELD/1926"
          },
          "remoteFields": {
            "ic": "1835"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N3492S",
            "4": "PA32/A",
            "5": "T180",
            "11": "UJM",
            "12": "1817",
            "15": "1840",
            "16": "↓",
            "17": "40",
            "19": "SQS",
            "20": "110",
            "21": "KGWO",
            "22": "1847",
            "25": "KSTJ./.UJM V9 SQS KGWO/1845"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-15",
      "description": "",
      "startTime": "1200",
      "atis": "W",
      "altimeters": {
        "KMLU": "2995",
        "KVKS": "2996",
        "KJAN": "2996",
        "KGWO": "2997"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "EAGLE9",
            "4": "F16/A",
            "5": "T450",
            "11": "HLI",
            "12": "1155",
            "15": "1207",
            "17": "07",
            "19": "SQS",
            "20": "120",
            "21": "MHZ",
            "22": "1214",
            "25": "KBNA./.HLI V535 SQS V9 MCB KMSY/1305"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N220HB",
            "4": "C210/A",
            "5": "T190",
            "11": "HEZ",
            "12": "1145",
            "15": "1210",
            "17": "10",
            "19": "MHZ",
            "20": "70",
            "21": "SQS",
            "22": "1228",
            "25": "KHOU./.HEZ V245 MHZ V11 HLI KMEM/1255"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N33AM",
            "4": "PAY1/A",
            "5": "T220",
            "16": "↑",
            "19": "KVKS P1218",
            "21": "MLU",
            "23": "+13",
            "24": "100",
            "25": "KVKS DORTS V417 MLU KSHV/0050",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "BE9L/A",
            "5": "T260",
            "11": "IGB",
            "12": "1157",
            "15": "1219",
            "19": "SQS",
            "20": "80",
            "21": "GLH",
            "22": "1237",
            "25": "KCBM IGB V278 GLH KGLH"
          },
          "remoteFields": {
            "ic": "1214"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N417K",
            "4": "PA24/A",
            "5": "T200",
            "16": "↑",
            "19": "KJAN P1209",
            "21": "MCB",
            "23": "+20",
            "24": "120",
            "25": "KJAN MHZ V557 MCB KHBG/0035",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N910PB",
            "4": "C441/A",
            "5": "T250",
            "16": "↑",
            "19": "KGWO P1226",
            "21": "UJM",
            "23": "+20",
            "24": "100",
            "25": "KGWO SQS V9 UJM KLIT/0050"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "EAGLE9",
            "4": "F16/A",
            "5": "T450",
            "11": "SQS",
            "12": "1207",
            "15": "1214",
            "19": "MHZ",
            "20": "120",
            "21": "MCB",
            "22": "1220",
            "25": "KBNA./.HLI V535 SQS V9 MCB KMSY/1305",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N220HB",
            "4": "C210/A",
            "5": "T190",
            "11": "MHZ",
            "12": "1210",
            "15": "1228",
            "19": "SQS",
            "20": "70",
            "21": "HLI",
            "22": "1250",
            "25": "KHOU./.HEZ V245 MHZ V11 HLI KMEM/1255"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "MUSIC41",
            "4": "C130/A",
            "5": "T300",
            "11": "GLH",
            "12": "1159",
            "15": "1214",
            "16": "↓",
            "19": "MHZ",
            "20": "110",
            "21": "KJAN",
            "22": "1219",
            "25": "KBAD./.GLH V74 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "1203"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N1217S",
            "4": "BE9L/A",
            "5": "T250",
            "11": "HLI",
            "12": "1200",
            "15": "1222",
            "16": "↓",
            "19": "SQS",
            "20": "100",
            "21": "KGWO",
            "22": "1229",
            "25": "KMEM./.HLI V535 SQS KGWO/1228"
          },
          "remoteFields": {
            "ic": "1207"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N314TP",
            "4": "BE33/A",
            "5": "T180",
            "11": "GLH",
            "12": "1200",
            "15": "1212",
            "19": "SQS",
            "20": "90",
            "21": "IGB",
            "22": "1242",
            "25": "KLLQ./.GLH V278 IGB KSTF/1248"
          },
          "remoteFields": {
            "ic": "1206"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N397FB",
            "4": "BE9L/A",
            "5": "T220",
            "11": "UJM",
            "12": "1155",
            "15": "1207",
            "17": "07",
            "19": "SQS",
            "20": "130",
            "21": "MHZ",
            "22": "1223",
            "25": "KOKC./.UJM V9 MCB KMSY/1305"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N397FB",
            "4": "BE9L/A",
            "5": "T220",
            "11": "SQS",
            "12": "1207",
            "15": "1223",
            "19": "MHZ",
            "20": "130",
            "21": "MCB",
            "22": "1247",
            "25": "KOKC./.UJM V9 MCB KMSY/1305",
            "30": "ZHU"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-16",
      "description": "",
      "startTime": "0900",
      "atis": "E",
      "altimeters": {
        "KMLU": "2991",
        "KVKS": "2994",
        "KJAN": "2995",
        "KGWO": "2992"
      },
      "strips": [
        {
          "type": "arrival",
          "spaces": {
            "3": "ANGEL33",
            "4": "C130/A",
            "5": "T280",
            "10": "66",
            "11": "MCB",
            "12": "0859",
            "15": "0914",
            "16": "↓",
            "19": "MHZ",
            "20": "150",
            "21": "KJAN",
            "22": "0919",
            "25": "KBTR./.MCB V9 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "0903"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N1217S",
            "4": "BE35/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KGWO P0914",
            "21": "GLH",
            "23": "+16",
            "24": "80",
            "25": "KGWO SQS V278 TXK KTYR/1010"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N228MK",
            "4": "BE20/A",
            "5": "T250",
            "10": "66",
            "11": "MLU",
            "12": "0901",
            "15": "0911",
            "16": "↓",
            "19": "DORTS",
            "20": "70",
            "21": "KVKS",
            "22": "0916",
            "25": "KGGG./.MLU V417 DORTS KVKS/0916"
          },
          "remoteFields": {
            "ic": "0904",
            "vksWx": false
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N3492S",
            "4": "C172/A",
            "5": "T150",
            "10": "66",
            "16": "↑",
            "19": "KGWO P0917",
            "21": "UJM",
            "23": "+30",
            "24": "90",
            "25": "KGWO SQS V9 UJM KMEM/1040"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N491NY",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KVKS P0921",
            "21": "HEZ",
            "23": "+12",
            "24": "100",
            "25": "KVKS HEZ V245 AEX KHOU/1040",
            "26": "FRC",
            "30": "ZHU"
          },
          "remoteFields": {
            "frc": true
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N881CD",
            "4": "C560/A",
            "5": "T360",
            "10": "66",
            "11": "KMLU",
            "12": "P0930",
            "16": "↑",
            "19": "STUEE",
            "21": "MHZ",
            "23": "+13",
            "24": "150",
            "25": "KMLU V18 MHZ V11 GCV KATL/1015"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "SNAKE6",
            "4": "C130/A",
            "5": "T250",
            "10": "66",
            "11": "MLU",
            "12": "0900",
            "15": "0906",
            "19": "STUEE",
            "20": "90",
            "21": "MHZ",
            "22": "0925",
            "25": "KSHV./.MLU V18 MHZ V245 IGB KCBM"
          },
          "remoteFields": {
            "ic": "0901"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N881CD",
            "4": "C560/A",
            "5": "T360",
            "10": "66",
            "11": "STUEE",
            "19": "MHZ",
            "21": "MIZZE",
            "23": "+12",
            "24": "150",
            "25": "KMLU V18 MHZ V11 GCV KATL/1015",
            "14a": "+13"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "SNAKE6",
            "4": "C130/A",
            "5": "T250",
            "10": "66",
            "11": "STUEE",
            "12": "0906",
            "15": "0925",
            "19": "MHZ",
            "20": "90",
            "21": "ZAMMA",
            "22": "0945",
            "25": "KSHV./.MLU V18 MHZ V245 IGB KCBM"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N374JE",
            "4": "C182/A",
            "5": "T180",
            "10": "66",
            "11": "GLH",
            "12": "0908",
            "15": "0920",
            "19": "SQS",
            "20": "70",
            "21": "HLI",
            "22": "0947",
            "25": "KLLQ GLH V278 SQS V11 HLI KEVV/1053"
          },
          "remoteFields": {
            "ic": "0914"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N361PQ",
            "4": "PA46/A",
            "5": "T220",
            "10": "66",
            "11": "ZAMMA",
            "12": "0857",
            "15": "0909",
            "19": "MHZ",
            "20": "100",
            "21": "DORTS",
            "22": "0921",
            "25": "KTUP IGB V245 MHZ V417 DORTS KVKS/0926"
          },
          "remoteFields": {
            "ic": "0905",
            "vksWx": false
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N361PQ",
            "4": "PA46/A",
            "5": "T220",
            "10": "66",
            "11": "MHZ",
            "12": "0909",
            "15": "0921",
            "16": "↓",
            "19": "DORTS",
            "20": "100",
            "21": "KVKS",
            "22": "0926",
            "25": "KTUP IGB V245 MHZ V417 DORTS KVKS/0926"
          },
          "remoteFields": {
            "vksWx": false
          }
        }
      ]
    },
    {
      "title": "NR-17",
      "description": "",
      "startTime": "1520",
      "atis": "X",
      "altimeters": {
        "KMLU": "2996",
        "KVKS": "2996",
        "KJAN": "2995",
        "KGWO": "2994"
      },
      "strips": [
        {
          "type": "departure",
          "spaces": {
            "3": "COBRA21",
            "4": "T37/G",
            "5": "T200",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1536",
            "21": "UJM",
            "23": "+17",
            "24": "100",
            "25": "KGWO SQS V9 UJM KMEM/0125"
          },
          "remoteFields": {
            "reqClnc": "1530"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "ENY3161",
            "4": "CRJ1/A",
            "5": "T420",
            "10": "66",
            "11": "MLU",
            "12": "1530",
            "15": "1533",
            "19": "STUEE",
            "20": "150",
            "21": "MHZ",
            "22": "1543",
            "25": "KDFW./.MLU V18 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "1531"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N1194C",
            "4": "C441/A",
            "5": "T240",
            "10": "66",
            "11": "HEZ",
            "12": "1528",
            "15": "1548",
            "19": "MHZ",
            "20": "90",
            "21": "ZAMMA",
            "22": "1600",
            "25": "KAEX V245 IGB KBNA/1651"
          },
          "remoteFields": {
            "ic": "1530"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N269R",
            "4": "PA46/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1549",
            "21": "GLH",
            "23": "+26",
            "24": "80",
            "25": "KJAN MHZ V74 KLIT/0100"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N3492S",
            "4": "PA46/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1549",
            "21": "GLH",
            "23": "+24",
            "24": "80",
            "25": "KJAN MHZ V74 KLIT/0100"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N88Q",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "16": "↑",
            "19": "KVKS P1532",
            "21": "MLU",
            "23": "+15",
            "24": "100",
            "25": "KVKS MLU KSHV/0050",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N9670S",
            "4": "BE9L/A",
            "5": "T200",
            "10": "66",
            "16": "↑",
            "19": "0M8 P1530",
            "21": "MHZ",
            "23": "+19",
            "24": "70",
            "25": "0M8 MHZ KJVW"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "ENY3161",
            "4": "CRJ1/A",
            "5": "T420",
            "10": "66",
            "11": "STUEE",
            "12": "1533",
            "15": "1543",
            "16": "↓",
            "19": "MHZ",
            "20": "150",
            "21": "KJAN",
            "22": "1548",
            "25": "KDFW./.MLU V18 MHZ KJAN"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N718HB",
            "4": "C182/T",
            "5": "T170",
            "10": "66",
            "11": "GLH",
            "12": "1509",
            "15": "1521",
            "17": "21",
            "19": "SQS",
            "20": "70",
            "21": "HLI",
            "22": "1550",
            "25": "KGLH GLH V278 SQS V11 HLI M41/1552"
          },
          "remoteFields": {
            "altReq": {
              "alt": "50",
              "t": "1521"
            }
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N9670S",
            "4": "BE9L/A",
            "5": "T200",
            "10": "66",
            "11": "0M8",
            "12": "P1530",
            "16": "↓",
            "19": "MHZ",
            "21": "KJVW",
            "24": "70",
            "25": "0M8 MHZ KJVW",
            "14a": "+19"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N143MH",
            "4": "PA31/A",
            "5": "T170",
            "10": "66",
            "11": "GLH",
            "12": "1521",
            "15": "1546",
            "19": "MHZ",
            "20": "90",
            "21": "MIZZE",
            "22": "1605",
            "25": "KPBF V74 MHZ V11 GCV KMOB/1639"
          },
          "remoteFields": {
            "ic": "1529"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N444LN",
            "4": "PAY3/A",
            "5": "T260",
            "10": "66",
            "11": "UJM",
            "12": "1516",
            "15": "1533",
            "16": "↓",
            "19": "SQS",
            "20": "130",
            "21": "KGWO",
            "22": "1540",
            "25": "KLNK./.UJM V9 SQS KGWO/1538"
          },
          "remoteFields": {
            "ic": "1524"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N5262J",
            "4": "BE58/A",
            "5": "T190",
            "10": "66",
            "11": "IGB",
            "12": "1506",
            "15": "1535",
            "19": "SQS",
            "20": "80",
            "21": "GLH",
            "22": "1547",
            "25": "KMGM./.IGB V278 KTXK/1640"
          },
          "remoteFields": {
            "ic": "1527"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DAL369",
            "4": "MD82/L",
            "5": "T420",
            "10": "66",
            "11": "MEI",
            "12": "1534",
            "15": "1544",
            "19": "MHZ",
            "20": "160",
            "21": "HATER",
            "22": "1551",
            "25": "KATL./.MEI V18 MHZ V427 MLU V18 EIC KSHV"
          },
          "remoteFields": {
            "ic": "1538"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DAL369",
            "4": "MD82/L",
            "5": "T420",
            "10": "66",
            "11": "MHZ",
            "12": "1544",
            "15": "1551",
            "19": "HATER",
            "20": "160",
            "21": "MLU",
            "22": "1558",
            "25": "KATL./.MHZ V427 MLU V18 EIC KSHV",
            "30": "ZFW"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-18",
      "description": "",
      "startTime": "1130",
      "atis": "Y",
      "altimeters": {
        "KMLU": "3001",
        "KVKS": "3000",
        "KJAN": "3000",
        "KGWO": "2999"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "BTA141",
            "4": "F100/G",
            "5": "T380",
            "10": "66",
            "11": "MLU",
            "12": "1139",
            "15": "1144",
            "19": "STUEE",
            "20": "130",
            "21": "MHZ",
            "22": "1157",
            "25": "KDAL./.MLU V18 MEI KATL"
          },
          "remoteFields": {
            "ic": "1141"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DAL103",
            "4": "MD88/L",
            "5": "T420",
            "10": "66",
            "11": "MLU",
            "12": "1144",
            "15": "1147",
            "19": "STUEE",
            "20": "170",
            "21": "MHZ",
            "22": "1158",
            "25": "KDFW./.MLU V18 MEI KATL"
          },
          "remoteFields": {
            "ic": "1145"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "DOG55",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1152",
            "21": "UJM",
            "23": "+19",
            "24": "120",
            "25": "KGWO SQS V9 UJM KMCI"
          },
          "remoteFields": {
            "depSeq": "1"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "ENY3235",
            "4": "SF34/A",
            "5": "T250",
            "10": "66",
            "11": "MCB",
            "12": "1129",
            "15": "1149",
            "16": "↓",
            "17": "49",
            "19": "MHZ",
            "20": "90",
            "21": "KJAN",
            "22": "1154",
            "25": "KMSY./.MCB V9 MHZ KJAN"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "LIFTR45",
            "4": "C12/A",
            "5": "T260",
            "10": "66",
            "11": "MEI",
            "12": "1136",
            "15": "1153",
            "19": "MHZ",
            "20": "140",
            "21": "STUEE",
            "22": "1212",
            "25": "KMEI MEI V18 MLU KMLU"
          },
          "remoteFields": {
            "ic": "1148"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N222AM",
            "4": "BE35/A",
            "5": "T200",
            "10": "66",
            "16": "↑",
            "19": "KVKS P1137",
            "21": "MLU",
            "23": "+20",
            "24": "100",
            "25": "KVKS MLU V18 EIC KSHV/0100",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "BE9L/A",
            "5": "T260",
            "10": "66",
            "11": "IGB",
            "12": "1113",
            "15": "1135",
            "19": "SQS",
            "20": "160",
            "21": "GLH",
            "22": "1149",
            "25": "KCBM IGB V278 GLH KLLQ/1158"
          },
          "remoteFields": {
            "ic": "1131",
            "altReq": {
              "alt": "140",
              "t": "1131"
            }
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N495HY",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1152",
            "21": "MHZ",
            "23": "+15",
            "24": "140",
            "25": "KGWO SQS V9 MCB KLCH/0050"
          },
          "remoteFields": {
            "depSeq": "2"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N917FL",
            "4": "BE9L/A",
            "5": "T280",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1143",
            "21": "HEZ",
            "23": "+20",
            "24": "140",
            "25": "KJAN MHZ V245 HEZ KLFK/0048",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "BTA141",
            "4": "F100/G",
            "5": "T380",
            "10": "66",
            "11": "STUEE",
            "12": "1144",
            "15": "1157",
            "19": "MHZ",
            "20": "130",
            "21": "MEI",
            "22": "1209",
            "25": "KDAL./.MLU V18 MEI KATL"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DAL103",
            "4": "MD88/L",
            "5": "T420",
            "10": "66",
            "11": "STUEE",
            "12": "1147",
            "15": "1158",
            "19": "MHZ",
            "20": "170",
            "21": "MEI",
            "22": "1208",
            "25": "KDFW./.MLU V18 MEI KATL"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "LIFTR45",
            "4": "C12/A",
            "5": "T260",
            "10": "66",
            "11": "MHZ",
            "12": "1153",
            "15": "1212",
            "16": "↓",
            "19": "STUEE",
            "20": "140",
            "21": "MLU",
            "22": "1220",
            "25": "KMEI MEI V18 MLU KMLU"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N495HY",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "KGWO",
            "12": "P1152",
            "19": "MHZ",
            "21": "MCB",
            "23": "+18",
            "24": "140",
            "25": "KGWO SQS V9 MCB KLCH",
            "30": "ZHU",
            "14a": "+15"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N432VR",
            "4": "C182/A",
            "5": "T170",
            "10": "66",
            "11": "GLH",
            "12": "1130",
            "15": "1142",
            "19": "SQS",
            "20": "90",
            "21": "IGB",
            "22": "1212",
            "25": "KLLQ GLH V278 IGB KBHM/1232"
          },
          "remoteFields": {
            "ic": "1136"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N653DD",
            "4": "BE20/A",
            "5": "T270",
            "10": "66",
            "11": "GLH",
            "12": "1127",
            "15": "1144",
            "16": "↓",
            "17": "44",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "1149",
            "25": "KLIT V74 MHZ KJAN/1147"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RCH24",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "HLI",
            "12": "1127",
            "15": "1145",
            "19": "SQS",
            "20": "160",
            "21": "MHZ",
            "22": "1157",
            "25": "KTIK./.HLI V535 SQS V9 MCB KMSY"
          },
          "remoteFields": {
            "ic": "1140"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RCH24",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "SQS",
            "12": "1145",
            "15": "1157",
            "19": "MHZ",
            "20": "160",
            "21": "MCB",
            "22": "1213",
            "25": "KTIK./.HLI V535 SQS V9 MCB KMSY",
            "30": "ZHU"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-19",
      "description": "",
      "startTime": "2240",
      "atis": "U",
      "altimeters": {
        "KMLU": "2991",
        "KVKS": "2991",
        "KJAN": "2992",
        "KGWO": "2992"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "AAL439",
            "4": "B722/A",
            "5": "T430",
            "10": "66",
            "11": "MLU",
            "12": "2238",
            "15": "2241",
            "17": "41",
            "19": "STUEE",
            "20": "130",
            "21": "MHZ",
            "22": "2252",
            "25": "KPHX./.MLU V18 MEI KATL"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "BOLT17",
            "4": "T44/A",
            "5": "T220",
            "10": "66",
            "11": "KMLU",
            "12": "P2300",
            "16": "↑",
            "19": "STUEE",
            "21": "MHZ",
            "23": "+21",
            "24": "90",
            "25": "KMLU V18 MHZ V11 GCV KMOB",
            "14a": "+8"
          },
          "remoteFields": {
            "depSeq": "2"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N3492S",
            "4": "B190/G",
            "5": "T250",
            "10": "66",
            "11": "KMLU",
            "12": "P2300",
            "16": "↑",
            "19": "STUEE",
            "21": "MHZ",
            "23": "+19",
            "24": "90",
            "25": "KMLU MLU V18 MHZ V11 GCV KMOB/0115",
            "14a": "+8"
          },
          "remoteFields": {
            "depSeq": "1"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N441L",
            "4": "C441/A",
            "5": "T240",
            "10": "66",
            "11": "MLU",
            "12": "2237",
            "15": "2242",
            "17": "42",
            "19": "STUEE",
            "20": "150",
            "21": "MHZ",
            "22": "2301",
            "25": "KADS./.MLU V18 MEI KATL/0030"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N78TT",
            "4": "BE23/A",
            "5": "T120",
            "10": "66",
            "16": "↑",
            "19": "KVKS P2248",
            "21": "KHEZ",
            "23": "+21",
            "24": "40",
            "25": "KVKS KHEZ/0025",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N82WP",
            "4": "G159/A",
            "5": "T300",
            "10": "66",
            "11": "MCB",
            "12": "2239",
            "15": "2254",
            "19": "MHZ",
            "20": "120",
            "21": "SQS",
            "22": "2306",
            "25": "KHMU MCB V9 UJM KFCY/2330"
          },
          "remoteFields": {
            "ic": "2243",
            "iafdof": "2241"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "AAL439",
            "4": "B722/A",
            "5": "T430",
            "10": "66",
            "11": "STUEE",
            "12": "2241",
            "15": "2252",
            "19": "MHZ",
            "20": "130",
            "21": "MEI",
            "22": "2302",
            "25": "KPHX./.MLU V18 MEI KATL"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "BOLT17",
            "4": "T44/A",
            "5": "T220",
            "10": "66",
            "11": "STUEE",
            "19": "MHZ",
            "21": "MIZZE",
            "23": "+17",
            "24": "90",
            "25": "KMLU V18 MHZ V11 GCV KMOB",
            "14a": "+21"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N122MA",
            "4": "C182/A",
            "5": "T120",
            "10": "66",
            "11": "GLH",
            "12": "2245",
            "15": "2303",
            "16": "↓",
            "19": "SQS",
            "20": "70",
            "21": "KGWO",
            "22": "2310",
            "25": "KLLQ./.GLH V278 SQS KGWO/2305"
          },
          "remoteFields": {
            "ic": "2247"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "B190/G",
            "5": "T250",
            "10": "66",
            "11": "STUEE",
            "19": "MHZ",
            "21": "MIZZE",
            "23": "+14",
            "24": "90",
            "25": "KMLU MLU V18 MHZ V11 GCV KMOB",
            "14a": "+19"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N441L",
            "4": "C441/A",
            "5": "T240",
            "10": "66",
            "11": "STUEE",
            "12": "2242",
            "15": "2301",
            "19": "MHZ",
            "20": "150",
            "21": "MEI",
            "22": "2319",
            "25": "KADS./.MLU V18 MEI KATL/0030"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N50LP",
            "4": "C500/A",
            "5": "T300",
            "10": "66",
            "11": "MIZZE",
            "12": "2237",
            "15": "2249",
            "19": "MHZ",
            "20": "100",
            "21": "SQS",
            "22": "2301",
            "25": "KHBG MIZZE V11 HLI M41/2325"
          },
          "remoteFields": {
            "ic": "2242"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N82WP",
            "4": "G159/A",
            "5": "T300",
            "10": "66",
            "11": "MHZ",
            "12": "2254",
            "15": "2306",
            "19": "SQS",
            "20": "120",
            "21": "UJM",
            "22": "2320",
            "25": "KHMU MCB V9 UJM KFCY/2330"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N144PP",
            "4": "C210/A",
            "5": "T200",
            "10": "66",
            "11": "HLI",
            "12": "2227",
            "15": "2255",
            "16": "↓",
            "19": "SQS",
            "20": "80",
            "21": "KGWO",
            "22": "2302",
            "25": "M41 HLI V535 SQS KGWO/2300"
          },
          "remoteFields": {
            "ic": "2245"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N50LP",
            "4": "C500/A",
            "5": "T300",
            "10": "66",
            "11": "GLH",
            "12": "2229",
            "15": "2301",
            "19": "SQS",
            "20": "100",
            "21": "HLI",
            "22": "2319",
            "25": "KHBG MIZZE V11 HLI M41/2325"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N64Y",
            "4": "BE9L/A",
            "5": "T240",
            "10": "66",
            "11": "GLH",
            "12": "2229",
            "15": "2248",
            "17": "48",
            "19": "MHZ",
            "20": "110",
            "21": "MIZZE",
            "22": "2303",
            "25": "KPBF V74 MHZ V11 GCV KPNS/2350"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N73JS",
            "4": "SW4/A",
            "5": "T280",
            "10": "66",
            "11": "GLH",
            "12": "2300",
            "15": "2305",
            "19": "SQS",
            "20": "150",
            "21": "IGB",
            "22": "2323",
            "25": "KLIT./.GLH V278 IGB KGTR/2335"
          },
          "remoteFields": {
            "ic": "2301"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "UAL266",
            "4": "B722/A",
            "5": "T460",
            "10": "66",
            "11": "MEI",
            "12": "2240",
            "15": "2249",
            "19": "MHZ",
            "20": "160",
            "21": "HEZ",
            "22": "2302",
            "25": "KMGM MEI V18 MHZ V245 KAEX",
            "30": "ZHU"
          },
          "remoteFields": {
            "ic": "2246"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N174YM",
            "4": "SW4/A",
            "5": "T300",
            "10": "66",
            "11": "ZAMMA",
            "12": "2241",
            "15": "2250",
            "19": "MHZ",
            "20": "140",
            "21": "HEZ",
            "22": "2306",
            "25": "KBNA./.IGB V245 KHEZ/2311",
            "30": "ZHU"
          },
          "remoteFields": {
            "ic": "2247",
            "altReq": {
              "alt": "80",
              "t": "2255"
            }
          }
        }
      ]
    },
    {
      "title": "NR-20",
      "description": "",
      "startTime": "2100",
      "atis": "J",
      "altimeters": {
        "KMLU": "3002",
        "KVKS": "3003",
        "KJAN": "3001",
        "KGWO": "3001"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "LIFTR45",
            "4": "C130/A",
            "5": "T265",
            "10": "66",
            "11": "MCB",
            "12": "2052",
            "15": "2109",
            "17": "09",
            "19": "MHZ",
            "20": "110",
            "21": "SQS",
            "22": "2122",
            "25": "KHMU MCB V9 SQS KGWO"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N33AM",
            "4": "PAY1/A",
            "5": "T220",
            "10": "66",
            "16": "↑",
            "19": "KVKS P2110",
            "21": "HEZ",
            "23": "+11",
            "24": "100",
            "25": "KVKS VKS HEZ V245 KAEX/0030",
            "30": "ZHU"
          },
          "remoteFields": {
            "reqClnc": "2107"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "BE9L/A",
            "5": "T250",
            "10": "66",
            "11": "GLH",
            "12": "2054",
            "15": "2105",
            "19": "SQS",
            "20": "50",
            "21": "IGB",
            "22": "2127",
            "25": "KLIT./.GLH V278 IGB KUBS/2132"
          },
          "remoteFields": {
            "ic": "2101",
            "altReq": {
              "alt": "70",
              "t": "2101"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N36PR",
            "4": "BE9L/A",
            "5": "T250",
            "10": "66",
            "11": "MLU",
            "12": "2104",
            "15": "2108",
            "19": "STUEE",
            "20": "130",
            "21": "MHZ",
            "22": "2124",
            "25": "KSHV./.MLU V18 MHZ KJAN/2130"
          },
          "remoteFields": {
            "ic": "2105"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N54DB",
            "4": "C172/A",
            "5": "T140",
            "10": "66",
            "16": "↑",
            "19": "KJAN P2128",
            "21": "GLH",
            "23": "+40",
            "24": "80",
            "25": "KJAN MHZ V74 GLH V278 KTXK/0058"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N820SB",
            "4": "C411/A",
            "5": "T240",
            "10": "66",
            "11": "MLU",
            "12": "2113",
            "15": "2125",
            "16": "↓",
            "19": "DORTS",
            "20": "70",
            "21": "KVKS",
            "22": "2130",
            "25": "KCRS./.MLU V417 DORTS KVKS/2130"
          },
          "remoteFields": {
            "ic": "2116",
            "vksWx": false
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "SPIRIT8",
            "4": "H/B2/A",
            "5": "T385",
            "10": "66",
            "11": "MEI",
            "12": "2049",
            "15": "2110",
            "17": "10",
            "19": "MHZ",
            "20": "120",
            "21": "STUEE",
            "22": "2122",
            "25": "KWRB./.MEI V18 MLU KIAB"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "LIFTR45",
            "4": "C130/A",
            "5": "T265",
            "10": "66",
            "11": "MHZ",
            "12": "2109",
            "15": "2122",
            "16": "↓",
            "19": "SQS",
            "20": "110",
            "21": "KGWO",
            "22": "2129",
            "25": "KHMU MCB V9 SQS KGWO"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N169ML",
            "4": "BE9L/A",
            "5": "T250",
            "10": "66",
            "11": "HLI",
            "12": "2050",
            "15": "2112",
            "19": "SQS",
            "20": "80",
            "21": "GLH",
            "22": "2122",
            "25": "M41 HLI V535 SQS V278 GLH KELD/2139"
          },
          "remoteFields": {
            "ic": "2103"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N36PR",
            "4": "BE9L/A",
            "5": "T250",
            "10": "66",
            "11": "STUEE",
            "12": "2108",
            "15": "2124",
            "16": "↓",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "2129",
            "25": "KSHV./.MLU V18 MHZ KJAN/2130"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "SPIRIT8",
            "4": "H/B2/A",
            "5": "T385",
            "10": "66",
            "11": "MHZ",
            "12": "2110",
            "15": "2122",
            "19": "STUEE",
            "20": "120",
            "21": "MLU",
            "22": "2125",
            "25": "KWRB./.MEI V18 MLU KIAB",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N119RE",
            "4": "C411/A",
            "5": "T240",
            "10": "66",
            "11": "IGB",
            "12": "2050",
            "15": "2112",
            "19": "SQS",
            "20": "100",
            "21": "GLH",
            "22": "2121",
            "25": "KSTF IGB V278 KTXK/2152"
          },
          "remoteFields": {
            "ic": "2105"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RCH24",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "GLH",
            "12": "2053",
            "15": "2059",
            "17": "59",
            "18": "2059",
            "19": "SQS",
            "20": "150",
            "21": "MHZ",
            "22": "2112",
            "25": "KBAD./.ELD V278 SQS V11 MHZ V427 MLU KBAD"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "BTA4236",
            "4": "SF34/A",
            "5": "T280",
            "10": "66",
            "11": "MEI",
            "12": "2059",
            "15": "2115",
            "19": "MHZ",
            "20": "160",
            "21": "HATER",
            "22": "2125",
            "25": "KATL./.MEI V18 MHZ V427 MLU V18 EIC KDTN"
          },
          "remoteFields": {
            "ic": "2110"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RCH24",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "SQS",
            "12": "2059",
            "15": "2112",
            "17": "12",
            "19": "MHZ",
            "20": "150",
            "21": "HATER",
            "22": "2122",
            "25": "KBAD./.SQS V11 MHZ V427 MLU KBAD"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "BTA4236",
            "4": "SF34/A",
            "5": "T280",
            "10": "66",
            "11": "MHZ",
            "12": "2115",
            "15": "2125",
            "19": "HATER",
            "20": "160",
            "21": "MLU",
            "22": "2135",
            "25": "KATL./.MHZ V427 MLU V18 EIC KDTN",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RCH24",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "MHZ",
            "12": "2112",
            "15": "2122",
            "19": "HATER",
            "20": "150",
            "21": "MLU",
            "22": "2132",
            "25": "KBAD./.MHZ V427 MLU KBAD",
            "30": "ZFW"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-21",
      "description": "",
      "startTime": "0005",
      "atis": "K",
      "altimeters": {
        "KMLU": "2991",
        "KVKS": "2991",
        "KJAN": "2990",
        "KGWO": "2989"
      },
      "strips": [
        {
          "type": "departure",
          "spaces": {
            "3": "FLEX35",
            "4": "C130/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KGWO P0019",
            "21": "IGB",
            "23": "+22",
            "24": "100",
            "25": "KGWO SQS V278 IGB KWRB"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N109UT",
            "4": "BE20/G",
            "5": "T220",
            "10": "66",
            "16": "↑",
            "19": "KVKS P0011",
            "21": "MLU",
            "23": "+13",
            "24": "120",
            "25": "KVKS MLU V18 SHV KDFW/0130",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N251PS",
            "4": "PAY2/A",
            "5": "T250",
            "10": "66",
            "11": "GLH",
            "12": "2359",
            "15": "0006",
            "17": "06",
            "19": "SQS",
            "20": "90",
            "21": "IGB",
            "22": "0030",
            "25": "KLLQ./.GLH V278 IGB KTUP/0039"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N270KA",
            "4": "PA46/A",
            "5": "T220",
            "10": "66",
            "11": "HEZ",
            "12": "2357",
            "15": "0017",
            "17": "17",
            "19": "MHZ",
            "20": "110",
            "21": "ZAMMA",
            "22": "0029",
            "25": "KAEX./.HEZ V245 IGB KUBS/0050"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N3492S",
            "4": "PC12/A",
            "5": "T205",
            "10": "66",
            "16": "↑",
            "19": "KJAN P0022",
            "21": "GLH",
            "23": "+24",
            "24": "80",
            "25": "KJAN MHZ V74 GLH V278 KTXK/0130"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N514JG",
            "4": "C560/X",
            "5": "T360",
            "10": "66",
            "11": "MLU",
            "12": "0008",
            "15": "0011",
            "19": "STUEE",
            "20": "170",
            "21": "MHZ",
            "22": "0023",
            "25": "KDFW./.MLU V18 MHZ V11 GCV KMOB/0048"
          },
          "remoteFields": {
            "ic": "0009"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N54DB",
            "4": "C172/A",
            "5": "T150",
            "10": "66",
            "16": "↑",
            "19": "KJAN P0032",
            "21": "GLH",
            "23": "+29",
            "24": "80",
            "25": "KJAN MHZ V74 GLH V278 KTXK/0058"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N56JA",
            "4": "BE35/A",
            "5": "T200",
            "10": "66",
            "16": "↑",
            "19": "KVKS P0023",
            "21": "HEZ",
            "23": "+16",
            "24": "60",
            "25": "KVKS VKS KHEZ/0020",
            "30": "ZHU"
          },
          "remoteFields": {
            "reqClnc": "0017"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N5JM",
            "4": "C500/A",
            "5": "T300",
            "10": "66",
            "11": "MLU",
            "12": "0005",
            "15": "0009",
            "17": "09",
            "19": "STUEE",
            "20": "110",
            "21": "MHZ",
            "22": "0021",
            "25": "KAGO./.MLU V18 MHZ KJAN/0024"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N620VB",
            "4": "C441/A",
            "5": "T280",
            "10": "66",
            "11": "HEZ",
            "12": "2356",
            "15": "0012",
            "17": "12",
            "19": "MHZ",
            "20": "130",
            "21": "ZAMMA",
            "22": "0022",
            "25": "KMSY./.HEZ V245 IGB KGTR/0046"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N976GV",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "MLU",
            "12": "0009",
            "15": "0014",
            "19": "STUEE",
            "20": "150",
            "21": "MHZ",
            "22": "0033",
            "25": "KDTN MLU V18 KMEI/0055"
          },
          "remoteFields": {
            "ic": "0012",
            "altReq": {
              "alt": "130",
              "t": "0015"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N514JG",
            "4": "C560/X",
            "5": "T360",
            "10": "66",
            "11": "STUEE",
            "12": "0011",
            "15": "0023",
            "19": "MHZ",
            "20": "170",
            "21": "MIZZE",
            "22": "0033",
            "25": "KDFW./.MLU V18 MHZ V11 GCV KMOB/0048"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N5JM",
            "4": "C500/A",
            "5": "T300",
            "10": "66",
            "11": "STUEE",
            "12": "0009",
            "15": "0021",
            "16": "↓",
            "19": "MHZ",
            "20": "110",
            "21": "KJAN",
            "22": "0026",
            "25": "KAGO./.MLU V18 MHZ KJAN/0024"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N976GV",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "STUEE",
            "12": "0014",
            "15": "0033",
            "19": "MHZ",
            "20": "150",
            "21": "MEI",
            "22": "0051",
            "25": "KDTN MLU V18 KMEI/0055"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N475HH",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "ZAMMA",
            "12": "0008",
            "15": "0019",
            "19": "MHZ",
            "20": "100",
            "21": "MCB",
            "22": "0037",
            "25": "KUBS IGB V245 MHZ V9 KMCB/0043",
            "30": "ZHU"
          },
          "remoteFields": {
            "ic": "0013"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N829PM",
            "4": "PA28/A",
            "5": "T180",
            "10": "66",
            "11": "IGB",
            "12": "2352",
            "15": "0020",
            "16": "↓",
            "19": "SQS",
            "20": "80",
            "21": "KGWO",
            "22": "0027",
            "25": "KSTF IGB V278 SQS KGWO/0025"
          },
          "remoteFields": {
            "ic": "0008"
          }
        }
      ]
    },
    {
      "title": "NR-22",
      "description": "",
      "startTime": "0900",
      "atis": "N",
      "altimeters": {
        "KMLU": "2991",
        "KVKS": "2994",
        "KJAN": "2995",
        "KGWO": "2992"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "HUNTR24",
            "4": "T2/X",
            "5": "T240",
            "10": "66",
            "11": "UJM",
            "12": "0903",
            "15": "0920",
            "19": "SQS",
            "20": "130",
            "21": "MHZ",
            "22": "0932",
            "25": "KMEM./.UJM V9 SQS V9 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "0910"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "LIFTR45",
            "4": "C12/A",
            "5": "T220",
            "10": "66",
            "11": "ZAMMA",
            "12": "0909",
            "15": "0921",
            "19": "MHZ",
            "20": "140",
            "21": "MCB",
            "22": "0939",
            "25": "KCBM IGB V245 MHZ V555 MCB KBTR",
            "30": "ZHU"
          },
          "remoteFields": {
            "ic": "0915"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "MUSIC33",
            "4": "C130/A",
            "5": "T280",
            "10": "66",
            "11": "MCB",
            "12": "0859",
            "15": "0914",
            "16": "↓",
            "19": "MHZ",
            "20": "150",
            "21": "KJAN",
            "22": "0919",
            "25": "KBTR./.MCB V9 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "0901"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N1217S",
            "4": "BE35/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KGWO P0914",
            "21": "GLH",
            "23": "+15",
            "24": "100",
            "25": "KGWO SQS V278 TXK KTYR/0110"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N172HG",
            "4": "C172/A",
            "5": "T150",
            "10": "66",
            "16": "↑",
            "19": "KGWO P0917",
            "21": "HLI",
            "23": "+35",
            "24": "90",
            "25": "KGWO SQS V11 HLI M41/0040"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N185DC",
            "4": "PA31/A",
            "5": "T160",
            "10": "66",
            "11": "MEI",
            "12": "0852",
            "15": "0915",
            "17": "15",
            "19": "MHZ",
            "20": "80",
            "21": "STUEE",
            "22": "0940",
            "25": "KMEI V18 MLU KDTN/1030"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N228MK",
            "4": "BE20/A",
            "5": "T250",
            "10": "66",
            "11": "MLU",
            "12": "0901",
            "15": "0911",
            "16": "↓",
            "19": "DORTS",
            "20": "90",
            "21": "KVKS",
            "22": "0916",
            "25": "KGGG./.MLU V417 DORTS KVKS/0916"
          },
          "remoteFields": {
            "ic": "0902",
            "vksWx": true
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N3492S",
            "4": "CRJ7/A",
            "5": "T420",
            "10": "66",
            "11": "HEZ",
            "12": "0900",
            "15": "0911",
            "16": "↓",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "0916",
            "25": "KAEX./.HEZ V245 MHZ KJAN/0918"
          },
          "remoteFields": {
            "ic": "0901"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N491NY",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KVKS P0921",
            "21": "HEZ",
            "23": "+11",
            "24": "120",
            "25": "KVKS VKS HEZ V245 AEX KHOU/0140",
            "26": "FRC",
            "30": "ZHU"
          },
          "remoteFields": {
            "frc": true
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N881CD",
            "4": "C560/A",
            "5": "T360",
            "10": "66",
            "16": "↑",
            "19": "KJAN P0930",
            "21": "GLH",
            "23": "+14",
            "24": "130",
            "25": "KJAN MHZ V74 LIT KLIT/0040"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N910PB",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KJAN P0920",
            "21": "MCB",
            "23": "+19",
            "24": "140",
            "25": "JKAN MHZ V557 MCB V194 BTR KBTR/0049",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "HUNTR24",
            "4": "T2/X",
            "5": "T240",
            "10": "66",
            "11": "SQS",
            "12": "0920",
            "15": "0932",
            "16": "↓",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "0937",
            "25": "KMEM./.UJM V9 SQS V9 MHZ KJAN"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N185DC",
            "4": "PA31/A",
            "5": "T160",
            "10": "66",
            "11": "MHZ",
            "12": "0915",
            "15": "0940",
            "19": "STUEE",
            "20": "80",
            "21": "MLU",
            "22": "0949",
            "25": "KMEI V18 MLU KDTN/1030",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DAL7231",
            "4": "CRJ1/A",
            "5": "T420",
            "10": "66",
            "11": "UJM",
            "12": "0902",
            "15": "0912",
            "19": "SQS",
            "20": "160",
            "21": "MHZ",
            "22": "0921",
            "25": "KMEM UJM V9 MCB RYTHM3 KMSY"
          },
          "remoteFields": {
            "ic": "0907",
            "iafdof": "0906"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N374JE",
            "4": "C182/A",
            "5": "T180",
            "10": "66",
            "11": "GLH",
            "12": "0906",
            "15": "0918",
            "19": "SQS",
            "20": "110",
            "21": "HLI",
            "22": "0958",
            "25": "KLLQ GLH V278 SQS V11 HLI KEVV/1053"
          },
          "remoteFields": {
            "ic": "0912"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DAL7231",
            "4": "CRJ1/A",
            "5": "T420",
            "10": "66",
            "11": "SQS",
            "12": "0912",
            "15": "0921",
            "19": "MHZ",
            "20": "160",
            "21": "MCB",
            "22": "0931",
            "25": "KMEM UJM V9 MCB RYTHM3 KMSY",
            "30": "ZHU"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-23",
      "description": "",
      "startTime": "1900",
      "atis": "B",
      "altimeters": {
        "KMLU": "3009",
        "KVKS": "2994",
        "KJAN": "2996",
        "KGWO": "2998"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "A68219",
            "4": "C130/A",
            "5": "T290",
            "10": "66",
            "11": "MLU",
            "12": "1904",
            "15": "1908",
            "19": "STUEE",
            "20": "130",
            "21": "MHZ",
            "22": "1923",
            "25": "KBAD MLU V18 MEI KMEI"
          },
          "remoteFields": {
            "ic": "1905"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "DUKE60",
            "4": "C130/A",
            "5": "T240",
            "10": "66",
            "11": "GLH",
            "12": "1902",
            "15": "1920",
            "19": "MHZ",
            "20": "130",
            "21": "MIZZE",
            "22": "1934",
            "25": "KGLH GLH V74 MHZ V11 GCV KMOB"
          },
          "remoteFields": {
            "ic": "1906"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N1176M",
            "4": "PA31/A",
            "5": "T220",
            "10": "66",
            "11": "GLH",
            "12": "1909",
            "15": "1918",
            "16": "↓",
            "19": "SQS",
            "20": "70",
            "21": "KGWO",
            "22": "1925",
            "25": "KGLH GLH V278 SQS KGWO/1926"
          },
          "remoteFields": {
            "ic": "1911"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N200ED",
            "4": "BE20/A",
            "5": "T270",
            "10": "66",
            "11": "HEZ",
            "12": "1902",
            "15": "1920",
            "16": "↓",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "1925",
            "25": "KHOU./.HEZ V245 MHZ KJAN/1923"
          },
          "remoteFields": {
            "ic": "1904"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N333GM",
            "4": "C560/A",
            "5": "T360",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1917",
            "21": "HLI",
            "23": "+17",
            "24": "130",
            "25": "KGWO SQS V535 HLI GHM GHM4 KBNA/0050",
            "26": "FRC"
          },
          "remoteFields": {
            "reqClnc": "1913",
            "frc": true
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "BE20/A",
            "5": "T220",
            "10": "66",
            "11": "MIZZE",
            "12": "1900",
            "15": "1915",
            "19": "MHZ",
            "20": "160",
            "21": "STUEE",
            "22": "1934",
            "25": "KMIA./.MIZZE V11 MHZ V18 MLU KMLU/1941"
          },
          "remoteFields": {
            "ic": "1909"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N380YB",
            "4": "C172/A",
            "5": "T120",
            "10": "66",
            "16": "↑",
            "19": "KVKS P1907",
            "21": "HEZ",
            "23": "+21",
            "24": "60",
            "25": "KVKS HEZ KAEX/1+00",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N7699N",
            "4": "PA46/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1930",
            "21": "IGB",
            "23": "+30",
            "24": "90",
            "25": "KGWO SQS V278 IGB KTUP/0035"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N922CS",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "KMLU",
            "12": "P1921",
            "16": "↑",
            "19": "STUEE",
            "21": "MHZ",
            "23": "+19",
            "24": "170",
            "25": "KMLU V18 MEI KBHM/0130",
            "14a": "+6"
          },
          "remoteFields": {
            "reqClnc": "1918"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "A68219",
            "4": "C130/A",
            "5": "T290",
            "10": "66",
            "11": "STUEE",
            "12": "1908",
            "15": "1923",
            "19": "MHZ",
            "20": "130",
            "21": "MEI",
            "22": "1937",
            "25": "KBAD MLU V18 MEI KMEI"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N112MX",
            "4": "C210/A",
            "5": "T180",
            "10": "66",
            "11": "MIZZE",
            "12": "1858",
            "15": "1917",
            "19": "MHZ",
            "20": "120",
            "21": "GLH",
            "22": "1942",
            "25": "KMOB V11 MHZ V74 KPBF/2006"
          },
          "remoteFields": {
            "ic": "1910"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N3492S",
            "4": "BE20/A",
            "5": "T220",
            "10": "66",
            "11": "MHZ",
            "12": "1915",
            "15": "1934",
            "16": "↓",
            "19": "STUEE",
            "20": "160",
            "21": "MLU",
            "22": "1939",
            "25": "KMIA./.MIZZE V11 MHZ V18 MLU KMLU/1941",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N922CS",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "STUEE",
            "19": "MHZ",
            "21": "MEI",
            "23": "+18",
            "24": "170",
            "25": "KMLU V18 MEI KBHM",
            "14a": "+19"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N299RK",
            "4": "BE76/A",
            "5": "T180",
            "10": "66",
            "11": "GLH",
            "12": "1900",
            "15": "1912",
            "19": "SQS",
            "20": "90",
            "21": "IGB",
            "22": "1941",
            "25": "KLIT./.GLH V278 IGB KTCL/2012"
          },
          "remoteFields": {
            "ic": "1905"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N893PP",
            "4": "BE40/A",
            "5": "T440",
            "10": "66",
            "11": "HLI",
            "12": "1902",
            "15": "1912",
            "16": "↓",
            "19": "SQS",
            "20": "120",
            "21": "KGWO",
            "22": "1919",
            "25": "KBNA./.HLI V535 SQS KGWO/1917"
          },
          "remoteFields": {
            "ic": "1907"
          }
        }
      ]
    },
    {
      "title": "NR-24",
      "description": "",
      "startTime": "1112",
      "atis": "Q",
      "altimeters": {
        "KMLU": "3006",
        "KVKS": "3005",
        "KJAN": "3001",
        "KGWO": "3005"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "N1176M",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "UJM",
            "12": "1108",
            "15": "1125",
            "19": "SQS",
            "20": "110",
            "21": "MHZ",
            "22": "1140",
            "25": "KMEM UJM V9 SQS V557 MHZ KJAN/1147"
          },
          "remoteFields": {
            "ic": "1114"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N172JS",
            "4": "C421/A",
            "5": "T180",
            "10": "66",
            "11": "MCB",
            "12": "1114",
            "15": "1138",
            "16": "↓",
            "19": "MHZ",
            "20": "130",
            "21": "KJAN",
            "22": "1143",
            "25": "KNEW./.MCB V9 MHZ KJAN/1141"
          },
          "remoteFields": {
            "ic": "1117"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N3492S",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "16": "↑",
            "19": "KVKS P1131",
            "21": "MHZ",
            "23": "+12",
            "24": "70",
            "25": "KVKS MHZ KJAN/0019"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N381HH",
            "4": "PA27/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1128",
            "21": "GLH",
            "23": "+26",
            "24": "140",
            "25": "KJAN MHZ V74 KLIT/0057"
          },
          "remoteFields": {
            "reqClnc": "1125"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N612LS",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "11": "MCB",
            "12": "1102",
            "15": "1120",
            "17": "20",
            "19": "MHZ",
            "20": "150",
            "21": "SQS",
            "22": "1134",
            "25": "KPCU./.MCB V9 SQS V535 HLI KAWM/1204"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N613LS",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "11": "MCB",
            "12": "1105",
            "15": "1123",
            "17": "23",
            "19": "MHZ",
            "20": "170",
            "21": "SQS",
            "22": "1137",
            "25": "KPCU./.MCB V9 SQS V535 HLI KAWM/1207"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N709SK",
            "4": "C152/A",
            "5": "T120",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1141",
            "21": "GLH",
            "23": "+23",
            "24": "60",
            "25": "KGWO SQS V278 GLH KELD/0114",
            "26": "FRC"
          },
          "remoteFields": {
            "frc": true
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N989GH",
            "4": "MU2/A",
            "5": "T220",
            "10": "66",
            "11": "MLU",
            "12": "1118",
            "15": "1131",
            "16": "↓",
            "19": "DORTS",
            "20": "110",
            "21": "KVKS",
            "22": "1136",
            "25": "KDTN./.MLU V417 DORTS KVKS/1136"
          },
          "remoteFields": {
            "ic": "1121",
            "vksWx": true
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RAIDR81",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "MLU",
            "12": "1116",
            "15": "1126",
            "19": "HATER",
            "20": "130",
            "21": "MHZ",
            "22": "1136",
            "25": "KBAD MLU V427 V11 GCV KPNS"
          },
          "remoteFields": {
            "ic": "1118"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N1176M",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "SQS",
            "12": "1125",
            "15": "1140",
            "16": "↓",
            "19": "MHZ",
            "20": "110",
            "21": "KJAN",
            "22": "1145",
            "25": "KMEM UJM V9 SQS V557 MHZ KJAN/1147"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N3492S",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "KVKS",
            "12": "1131",
            "16": "↓",
            "19": "MHZ",
            "21": "KJAN",
            "23": "+5",
            "24": "70",
            "25": "KVKS MHZ KJAN",
            "14a": "+12"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N612LS",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "11": "MHZ",
            "12": "1120",
            "15": "1134",
            "19": "SQS",
            "20": "150",
            "21": "HLI",
            "22": "1152",
            "25": "KPCU./.MCB V9 SQS V535 HLI KAWM/1204"
          },
          "remoteFields": {
            "altReq": {
              "alt": "130",
              "t": "1134"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N613LS",
            "4": "C441/A",
            "5": "T250",
            "10": "66",
            "11": "MHZ",
            "12": "1123",
            "15": "1137",
            "19": "SQS",
            "20": "170",
            "21": "HLI",
            "22": "1155",
            "25": "KPCU./.MCB V9 SQS V535 HLI KAWM/1207"
          },
          "remoteFields": {
            "altReq": {
              "alt": "150",
              "t": "1137"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "RAIDR81",
            "4": "C130/A",
            "5": "T300",
            "10": "66",
            "11": "HATER",
            "12": "1126",
            "15": "1136",
            "19": "MHZ",
            "20": "130",
            "21": "MIZZE",
            "22": "1148",
            "25": "KBAD MLU V427 V11 GCV KPNS"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N302HG",
            "4": "C182/I",
            "5": "T150",
            "10": "66",
            "11": "GLH",
            "12": "1118",
            "15": "1128",
            "19": "SQS",
            "20": "90",
            "21": "HLI",
            "22": "1158",
            "25": "KPBF V278 SQS V11 HLI M41/1158"
          },
          "remoteFields": {
            "ic": "1122"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N429ZX",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "UJM",
            "12": "1118",
            "15": "1135",
            "16": "↓",
            "19": "SQS",
            "20": "90",
            "21": "KGWO",
            "22": "1142",
            "25": "KMEM UJM V9 SQS KGWO/1140"
          },
          "remoteFields": {
            "ic": "1129"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N148BY",
            "4": "BE10/A",
            "5": "T240",
            "10": "66",
            "11": "IGB",
            "12": "1059",
            "15": "1121",
            "19": "SQS",
            "20": "80",
            "21": "GLH",
            "22": "1130",
            "25": "KMGM IGB V278 GLH KGLH/1136"
          },
          "remoteFields": {
            "ic": "1113"
          }
        }
      ]
    },
    {
      "title": "NR-25",
      "description": "",
      "startTime": "1100",
      "atis": "S",
      "altimeters": {
        "KMLU": "2991",
        "KVKS": "2991",
        "KJAN": "2993",
        "KGWO": "2994"
      },
      "strips": [
        {
          "type": "enroute",
          "spaces": {
            "3": "AAL651",
            "4": "MD82/A",
            "5": "T420",
            "10": "66",
            "11": "MLU",
            "12": "1103",
            "15": "1110",
            "19": "DORTS",
            "20": "170",
            "21": "MHZ",
            "22": "1117",
            "25": "KDFW./.MLU V417 MHZ KJAN"
          },
          "remoteFields": {
            "ic": "1105"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "CLAW19",
            "4": "C12/A",
            "5": "T250",
            "10": "66",
            "11": "ZAMMA",
            "12": "1046",
            "15": "1057",
            "17": "57",
            "18": "1057",
            "19": "MHZ",
            "20": "140",
            "21": "STUEE",
            "22": "1116",
            "25": "KCBM./.ZAMMA V245 MHZ V18 MLU KMLU"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "CLAW29",
            "4": "C12/A",
            "5": "T250",
            "10": "66",
            "11": "MIZZE",
            "12": "1050",
            "15": "1103",
            "17": "03",
            "19": "MHZ",
            "20": "100",
            "21": "STUEE",
            "22": "1121",
            "25": "KPRN./.MIZZE V11 MHZ V18 MLU KMLU"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N219PW",
            "4": "C650/A",
            "5": "T450",
            "10": "66",
            "11": "MCB",
            "12": "1100",
            "15": "1110",
            "19": "MHZ",
            "20": "170",
            "21": "SQS",
            "22": "1118",
            "25": "KHMU MCB V9 SQS V11 HLI V94 JKS GHM KBNA/1210"
          },
          "remoteFields": {
            "ic": "1102"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N220HB",
            "4": "BE20/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KVKS P1111",
            "21": "HEZ",
            "23": "+11",
            "24": "80",
            "25": "KVKS HEZ KAEX/0042",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N3492S",
            "4": "C210/A",
            "5": "T150",
            "10": "66",
            "11": "UJM",
            "12": "1102",
            "15": "1126",
            "16": "↓",
            "19": "SQS",
            "20": "90",
            "21": "KGWO",
            "22": "1133",
            "25": "KMCI./.UJM V9 SQS KGWO/1135"
          },
          "remoteFields": {
            "ic": "1112"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N415LZ",
            "4": "C414/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1120",
            "21": "HATER",
            "23": "+12",
            "24": "120",
            "25": "KJAN MHZ V427 MLU KSHV/0048"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N731AT",
            "4": "C210/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1122",
            "21": "HLI",
            "23": "+29",
            "24": "70",
            "25": "KGWO SQS V11 HLI KMEM/0048"
          },
          "remoteFields": {
            "reqClnc": "1118"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N865BS",
            "4": "PA32/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1121",
            "21": "MCB",
            "23": "+25",
            "24": "80",
            "25": "KJAN MHZ V9 MCB KBTR/0051",
            "30": "ZHU"
          },
          "remoteFields": {
            "reqClnc": "1117"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "AAL651",
            "4": "MD82/A",
            "5": "T420",
            "10": "66",
            "11": "DORTS",
            "12": "1110",
            "15": "1117",
            "16": "↓",
            "19": "MHZ",
            "20": "170",
            "21": "KJAN",
            "22": "1122",
            "25": "KDFW./.MLU V417 MHZ KJAN"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "CLAW19",
            "4": "C12/A",
            "5": "T250",
            "10": "66",
            "11": "MHZ",
            "12": "1057",
            "15": "1116",
            "16": "↓",
            "17": "16",
            "19": "STUEE",
            "20": "140",
            "21": "MLU",
            "22": "1121",
            "25": "KCBM./.ZAMMA V245 MHZ V18 MLU KMLU",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "CLAW29",
            "4": "C12/A",
            "5": "T250",
            "10": "66",
            "11": "MHZ",
            "12": "1103",
            "15": "1121",
            "16": "↓",
            "19": "STUEE",
            "20": "100",
            "21": "MLU",
            "22": "1126",
            "25": "KPRN./.MIZZE V11 MHZ V18 MLU KMLU",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N103YC",
            "4": "PAY3/A",
            "5": "T300",
            "10": "66",
            "11": "MIZZE",
            "12": "1107",
            "15": "1119",
            "19": "MHZ",
            "20": "160",
            "21": "GLH",
            "22": "1134",
            "25": "KMOB V11 MHZ V74 GLH KGLH/1134"
          },
          "remoteFields": {
            "ic": "1115",
            "altReq": {
              "alt": "100",
              "t": "1124"
            }
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N219PW",
            "4": "C650/A",
            "5": "T450",
            "10": "66",
            "11": "MHZ",
            "12": "1110",
            "15": "1118",
            "19": "SQS",
            "20": "170",
            "21": "HLI",
            "22": "1131",
            "25": "KHMU./.MHZ V9 SQS V11 HLI V94 JKS GHM KBNA/1210"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N415LZ",
            "4": "C414/A",
            "5": "T250",
            "10": "66",
            "11": "KJAN",
            "12": "P1120",
            "19": "HATER",
            "21": "MLU",
            "23": "+12",
            "24": "120",
            "25": "KJAN MHZ V427 MLU KSHV",
            "30": "ZFW",
            "14a": "+12"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N392MK",
            "4": "BE20/A",
            "5": "T290",
            "10": "66",
            "11": "GLH",
            "12": "1107",
            "15": "1122",
            "16": "↓",
            "19": "MHZ",
            "20": "110",
            "21": "KJAN",
            "22": "1127",
            "25": "KPBF V74 MHZ KJAN/1125"
          },
          "remoteFields": {
            "ic": "1111"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N492MK",
            "4": "AC11/A",
            "5": "T120",
            "10": "66",
            "11": "GLH",
            "12": "1056",
            "15": "1116",
            "19": "SQS",
            "20": "90",
            "21": "IGB",
            "22": "1159",
            "25": "KLLQ GLH V278 IGB KTUP/1215"
          },
          "remoteFields": {
            "ic": "1107"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N51MS",
            "4": "BE10/A",
            "5": "T220",
            "10": "66",
            "11": "GLH",
            "12": "1056",
            "15": "1105",
            "17": "05",
            "19": "SQS",
            "20": "110",
            "21": "IGB",
            "22": "1127",
            "25": "KLRF GLH V278 IGB KSTF/1150"
          },
          "remoteFields": {}
        }
      ]
    },
    {
      "title": "NR-26",
      "description": "",
      "startTime": "1019",
      "atis": "M",
      "altimeters": {
        "KMLU": "2997",
        "KVKS": "2995",
        "KJAN": "2995",
        "KGWO": "2998"
      },
      "strips": [
        {
          "type": "departure",
          "spaces": {
            "3": "FLG394",
            "4": "SF34/A",
            "5": "T250",
            "10": "66",
            "11": "KMLU",
            "12": "P1026",
            "16": "↑",
            "19": "STUEE",
            "21": "MHZ",
            "23": "+19",
            "24": "130",
            "25": "KMLU V18 MHZ V245 IGB KSTF",
            "26": "FRC",
            "14a": "+7"
          },
          "remoteFields": {
            "frc": true
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N233JW",
            "4": "BE20/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1031",
            "21": "GLH",
            "23": "+20",
            "24": "100",
            "25": "KJAN MHZ V74 KLIT/0046"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N3492S",
            "4": "PA46/A",
            "5": "T180",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1041",
            "21": "STUEE",
            "23": "+25",
            "24": "120",
            "25": "KJAN MHZ V18 MLU KTYR/0116"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N56X",
            "4": "BE20/A",
            "5": "T240",
            "10": "66",
            "11": "MLU",
            "12": "1019",
            "15": "1031",
            "16": "↓",
            "19": "DORTS",
            "20": "110",
            "21": "KVKS",
            "22": "1036",
            "25": "KSHV./.MLU V417 DORTS KVKS/1033"
          },
          "remoteFields": {
            "ic": "1021",
            "vksWx": false
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N726SC",
            "4": "C425/A",
            "5": "T240",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1037",
            "21": "GLH",
            "23": "+13",
            "24": "60",
            "25": "KGWO SQS V278 MON KLLQ/0028"
          },
          "remoteFields": {
            "reqClnc": "1034"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N812Z",
            "4": "C425/A",
            "5": "T250",
            "10": "66",
            "16": "↑",
            "19": "0M8 P1040",
            "21": "MHZ",
            "23": "+16",
            "24": "70",
            "25": "0M8 MHZ KJAN/0020"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "TURK59",
            "4": "T2/A",
            "5": "T240",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1041",
            "21": "STUEE",
            "23": "+19",
            "24": "120",
            "25": "KJAN MHZ V18 MLU KTYR"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "FLG394",
            "4": "SF34/A",
            "5": "T250",
            "10": "66",
            "11": "STUEE",
            "19": "MHZ",
            "21": "ZAMMA",
            "23": "+12",
            "24": "130",
            "25": "KMLU V18 MHZ V245 IGB KSTF",
            "14a": "+19"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N1176M",
            "4": "C208/A",
            "5": "T180",
            "10": "66",
            "11": "IGB",
            "12": "1016",
            "15": "1025",
            "19": "SQS",
            "20": "140",
            "21": "GLH",
            "22": "1037",
            "25": "KSTF./.IGB V278 GLH KTXK/1053"
          },
          "remoteFields": {
            "ic": "1019"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N3492S",
            "4": "PA46/A",
            "5": "T180",
            "10": "66",
            "11": "KJAN",
            "12": "P1041",
            "19": "STUEE",
            "21": "MLU",
            "23": "+6",
            "24": "120",
            "25": "KJAN MHZ V18 MLU KTYR",
            "30": "ZFW",
            "14a": "+25"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N812Z",
            "4": "C425/A",
            "5": "T250",
            "10": "66",
            "11": "0M8",
            "12": "P1040",
            "16": "↓",
            "19": "MHZ",
            "21": "KJAN",
            "23": "+5",
            "24": "70",
            "25": "0M8 MHZ KJAN",
            "14a": "+16"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "TURK59",
            "4": "T2/A",
            "5": "T240",
            "10": "66",
            "11": "KJAN",
            "12": "P1041",
            "19": "STUEE",
            "21": "MLU",
            "23": "+5",
            "24": "120",
            "25": "KJAN MHZ V18 MLU KTYR/0105",
            "30": "ZFW",
            "14a": "+19"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N100TK",
            "4": "C310/A",
            "5": "T180",
            "10": "66",
            "11": "IGB",
            "12": "1012",
            "15": "1041",
            "19": "SQS",
            "20": "80",
            "21": "GLH",
            "22": "1053",
            "25": "KTCL./.IGB V278 KTXK/1155"
          },
          "remoteFields": {
            "ic": "1030"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "SWINE21",
            "4": "A10/A",
            "5": "T300",
            "10": "66",
            "11": "UJM",
            "12": "1018",
            "15": "1032",
            "16": "↓",
            "19": "SQS",
            "20": "130",
            "21": "KGWO",
            "22": "1039",
            "25": "KLRF./.UJM V9 SQS KGWO"
          },
          "remoteFields": {
            "ic": "1024"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N426",
            "4": "BE9L/A",
            "5": "T220",
            "10": "66",
            "11": "ZAMMA",
            "12": "1026",
            "15": "1038",
            "19": "MHZ",
            "20": "120",
            "21": "HEZ",
            "22": "1100",
            "25": "KBNA./.IGB V245 KHEZ/1105",
            "30": "ZHU"
          },
          "remoteFields": {
            "ic": "1030",
            "altReq": {
              "alt": "80",
              "t": "1039"
            }
          }
        }
      ]
    },
    {
      "title": "NR-27",
      "description": "",
      "startTime": "1600",
      "atis": "A",
      "altimeters": {
        "KMLU": "3001",
        "KVKS": "2999",
        "KJAN": "3004",
        "KGWO": "3005"
      },
      "strips": [
        {
          "type": "departure",
          "spaces": {
            "3": "BTA4622",
            "4": "SF34/A",
            "5": "T280",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1620",
            "21": "HEZ",
            "23": "+18",
            "24": "140",
            "25": "KJAN MHZ V245 AEX DAS KIAH",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N357HP",
            "4": "BE9L/A",
            "5": "T220",
            "10": "66",
            "16": "↑",
            "19": "KJAN P1621",
            "21": "HEZ",
            "23": "+22",
            "24": "140",
            "25": "KJAN MHZ V245 AEX KHOU/0130",
            "30": "ZHU"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N414MW",
            "4": "C414/A",
            "5": "T200",
            "10": "66",
            "11": "KMLU",
            "12": "P1630",
            "16": "↑",
            "19": "STUEE",
            "21": "MHZ",
            "23": "+25",
            "24": "90",
            "25": "KMLU V18 MHZ V245 IGB KSTF/0117",
            "14a": "+8"
          },
          "remoteFields": {}
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N518PK",
            "4": "C210/X",
            "5": "T150",
            "10": "66",
            "11": "MCB",
            "12": "1600",
            "15": "1624",
            "16": "↓",
            "19": "MHZ",
            "20": "70",
            "21": "KJVW",
            "22": "1629",
            "25": "KHOU./.MCB V557 MHZ KJVW/1629"
          },
          "remoteFields": {
            "ic": "1602"
          }
        },
        {
          "type": "departure",
          "spaces": {
            "3": "N63TS",
            "4": "PA32/A",
            "5": "T210",
            "10": "66",
            "16": "↑",
            "19": "KVKS P1609",
            "21": "MLU",
            "23": "+15",
            "24": "80",
            "25": "KVKS MLU KTYR/0115",
            "30": "ZFW"
          },
          "remoteFields": {}
        },
        {
          "type": "departure",
          "spaces": {
            "3": "SWINE26",
            "4": "A10/A",
            "5": "T300",
            "10": "66",
            "16": "↑",
            "19": "KGWO P1625",
            "21": "IGB",
            "23": "+21",
            "24": "110",
            "25": "KGWO SQS V278 IGB KCBM"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N414MW",
            "4": "C414/A",
            "5": "T200",
            "10": "66",
            "11": "STUEE",
            "19": "MHZ",
            "21": "ZAMMA",
            "23": "+16",
            "24": "90",
            "25": "KMLU V18 MHZ V245 IGB KSTF",
            "14a": "+25"
          },
          "remoteFields": {}
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N150RB",
            "4": "C210/A",
            "5": "T170",
            "10": "66",
            "11": "ZAMMA",
            "12": "1555",
            "15": "1610",
            "17": "10",
            "19": "MHZ",
            "20": "100",
            "21": "DORTS",
            "22": "1626",
            "25": "KSTF./.IGB V245 MHZ V417 DORTS KVKS/1633"
          },
          "remoteFields": {
            "vksWx": false
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N200ZT",
            "4": "BE35/A",
            "5": "T200",
            "10": "66",
            "11": "UJM",
            "12": "1553",
            "15": "1616",
            "16": "↓",
            "19": "SQS",
            "20": "90",
            "21": "KGWO",
            "22": "1623",
            "25": "KSTL./.UJM V9 SQS KGWO/1621"
          },
          "remoteFields": {
            "ic": "1608"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "N866GB",
            "4": "BE55/A",
            "5": "T170",
            "10": "66",
            "11": "GLH",
            "12": "1604",
            "15": "1616",
            "19": "SQS",
            "20": "90",
            "21": "HLI",
            "22": "1646",
            "25": "KLIT./.GLH V278 SQS V535 HLI KMEM/1700"
          },
          "remoteFields": {
            "ic": "1611"
          }
        },
        {
          "type": "enroute",
          "spaces": {
            "3": "FDX524",
            "4": "B722/G",
            "5": "T380",
            "10": "66",
            "11": "IGB",
            "12": "1558",
            "15": "1612",
            "19": "SQS",
            "20": "160",
            "21": "GLH",
            "22": "1618",
            "25": "KMGM./.IGB V278 GLH V74 KLIT"
          },
          "remoteFields": {
            "ic": "1603"
          }
        },
        {
          "type": "arrival",
          "spaces": {
            "3": "N150RB",
            "4": "C210/A",
            "5": "T170",
            "10": "66",
            "11": "MHZ",
            "12": "1610",
            "15": "1626",
            "16": "↓",
            "19": "DORTS",
            "20": "100",
            "21": "KVKS",
            "22": "1633",
            "25": "KSTF./.MHZ V417 DORTS KVKS/1633"
          },
          "remoteFields": {}
        }
      ]
    }
  ]
};
