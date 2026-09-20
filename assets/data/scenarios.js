/*
 * Static "level" scenarios for Practice Scenarios (27 total).
 * Each entry is either null (not authored yet) or:
 *   { title, description, startTime, atis, altimeters, strips: [ { type, spaces, remoteFields }, ... ] }
 *
 * Baked into the site (same for everyone). Author them on the Practice
 * Scenarios page (Author static levels -> Save to slot -> Export static JSON)
 * and paste the export here. Authored so far: NR-11, NR-13, NR-14, NR-15, NR-16, NR-17.
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
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ]
};
