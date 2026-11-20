// Auto-generated from 昇兴三片罐MOM全系统原型-单文件版(3)-无设计器.html
export interface MomMenuItem {
  id: string;
  name: string;
  arch: string;
}

export interface MomMenuGroup {
  name: string;
  items: MomMenuItem[];
}

export interface MomMenuModule {
  id: string;
  name: string;
  groups: MomMenuGroup[];
}

export interface MomLeafMeta {
  id: string;
  name: string;
  module: string;
  group: string;
  path: string;
  arch: string;
}

export const MOM_IMPORTED_MENU: MomMenuModule[] = [
  {
    "id": "m0",
    "name": "配置中心",
    "groups": [
      {
        "name": "系统基础",
        "items": [
          {
            "id": "p001",
            "name": "多语言配置",
            "arch": "config"
          },
          {
            "id": "p002",
            "name": "数据字典",
            "arch": "config"
          },
          {
            "id": "p003",
            "name": "数采设备信息",
            "arch": "list"
          }
        ]
      },
      {
        "name": "物料基础",
        "items": [
          {
            "id": "p004",
            "name": "物料信息",
            "arch": "list"
          },
          {
            "id": "p005",
            "name": "产品BOM信息",
            "arch": "config"
          },
          {
            "id": "p006",
            "name": "替代料设置",
            "arch": "config"
          },
          {
            "id": "p007",
            "name": "销售BOM信息",
            "arch": "config"
          },
          {
            "id": "p008",
            "name": "工序信息",
            "arch": "config"
          },
          {
            "id": "p009",
            "name": "工艺路线",
            "arch": "config"
          },
          {
            "id": "p011",
            "name": "工艺参数",
            "arch": "config"
          },
          {
            "id": "p012",
            "name": "工艺参数文件",
            "arch": "config"
          },
          {
            "id": "p014",
            "name": "生产节拍",
            "arch": "list"
          },
          {
            "id": "p020",
            "name": "关键物料",
            "arch": "list"
          },
          {
            "id": "p021",
            "name": "E-SOP文件信息",
            "arch": "list"
          },
          {
            "id": "p022",
            "name": "E-SOP文件配置",
            "arch": "config"
          },
          {
            "id": "p023",
            "name": "E-SOP产品配置",
            "arch": "config"
          },
          {
            "id": "p024",
            "name": "E-SOP履历信息",
            "arch": "list"
          }
        ]
      },
      {
        "name": "业务基础",
        "items": [
          {
            "id": "p027",
            "name": "供应商信息",
            "arch": "list"
          },
          {
            "id": "p028",
            "name": "客户信息",
            "arch": "list"
          },
          {
            "id": "p029",
            "name": "模板设计",
            "arch": "config"
          },
          {
            "id": "p030",
            "name": "看板配置",
            "arch": "dashboard"
          },
          {
            "id": "p032",
            "name": "成本中心",
            "arch": "list"
          }
        ]
      },
      {
        "name": "条码基础",
        "items": [
          {
            "id": "p033",
            "name": "条码生成变量",
            "arch": "form"
          },
          {
            "id": "p034",
            "name": "条码生成配置",
            "arch": "form"
          },
          {
            "id": "p035",
            "name": "条码校验规则",
            "arch": "config"
          }
        ]
      }
    ]
  },
  {
    "id": "m1",
    "name": "仓库管理",
    "groups": [
      {
        "name": "管理模型",
        "items": [
          {
            "id": "p036",
            "name": "仓库建模",
            "arch": "config"
          },
          {
            "id": "p038",
            "name": "单据类型",
            "arch": "config"
          },
          {
            "id": "p039",
            "name": "仓库存储策略",
            "arch": "list"
          },
          {
            "id": "p041",
            "name": "拣货方案信息",
            "arch": "config"
          },
          {
            "id": "p042",
            "name": "拣货方案",
            "arch": "config"
          },
          {
            "id": "p046",
            "name": "叉车信息维护",
            "arch": "config"
          }
        ]
      },
      {
        "name": "采购管理",
        "items": [
          {
            "id": "p048",
            "name": "采购订单",
            "arch": "list"
          },
          {
            "id": "p049",
            "name": "预先发货清单",
            "arch": "form"
          }
        ]
      },
      {
        "name": "入库作业",
        "items": [
          {
            "id": "p050",
            "name": "采购入库",
            "arch": "form"
          },
          {
            "id": "p051",
            "name": "完工入库",
            "arch": "form"
          },
          {
            "id": "p052",
            "name": "生产退料",
            "arch": "list"
          },
          {
            "id": "p053",
            "name": "其他入库",
            "arch": "form"
          },
          {
            "id": "p054",
            "name": "销售退货",
            "arch": "form"
          },
          {
            "id": "p055",
            "name": "废品入库",
            "arch": "form"
          },
          {
            "id": "p056",
            "name": "杂收入库",
            "arch": "form"
          }
        ]
      },
      {
        "name": "库内作业",
        "items": [
          {
            "id": "p057",
            "name": "库存盘点",
            "arch": "form"
          },
          {
            "id": "p058",
            "name": "盘点作业",
            "arch": "form"
          },
          {
            "id": "p059",
            "name": "库存冻结",
            "arch": "form"
          },
          {
            "id": "p060",
            "name": "库存报废",
            "arch": "form"
          },
          {
            "id": "p061",
            "name": "来料打印",
            "arch": "form"
          },
          {
            "id": "p062",
            "name": "批次物料出入库",
            "arch": "form"
          },
          {
            "id": "p063",
            "name": "物料移动记录",
            "arch": "list"
          },
          {
            "id": "p065",
            "name": "库位移动",
            "arch": "list"
          },
          {
            "id": "p066",
            "name": "无码物料移动",
            "arch": "list"
          },
          {
            "id": "p067",
            "name": "库存盘点表",
            "arch": "form"
          },
          {
            "id": "p068",
            "name": "生产废铁分摊",
            "arch": "list"
          },
          {
            "id": "p069",
            "name": "仓库盘点",
            "arch": "form"
          },
          {
            "id": "p070",
            "name": "呆滞料报废",
            "arch": "form"
          },
          {
            "id": "p071",
            "name": "客户报废作业",
            "arch": "form"
          }
        ]
      },
      {
        "name": "出库作业",
        "items": [
          {
            "id": "p072",
            "name": "生产领料",
            "arch": "form"
          },
          {
            "id": "p073",
            "name": "销售发货",
            "arch": "form"
          },
          {
            "id": "p074",
            "name": "其他出库",
            "arch": "form"
          },
          {
            "id": "p075",
            "name": "采购退料",
            "arch": "list"
          },
          {
            "id": "p076",
            "name": "承运商路线",
            "arch": "config"
          },
          {
            "id": "p077",
            "name": "废品销售发货",
            "arch": "form"
          },
          {
            "id": "p078",
            "name": "生产领料审核",
            "arch": "form"
          },
          {
            "id": "p079",
            "name": "杂发出库",
            "arch": "form"
          },
          {
            "id": "p080",
            "name": "出货单打印",
            "arch": "form"
          },
          {
            "id": "p081",
            "name": "公司间销售发货单",
            "arch": "form"
          },
          {
            "id": "p082",
            "name": "内部交易退货",
            "arch": "form"
          },
          {
            "id": "p083",
            "name": "调拨作业",
            "arch": "form"
          }
        ]
      },
      {
        "name": "信息查询",
        "items": [
          {
            "id": "p084",
            "name": "实时库存",
            "arch": "list"
          },
          {
            "id": "p085",
            "name": "SAP库存",
            "arch": "list"
          },
          {
            "id": "p086",
            "name": "销售发货统计表",
            "arch": "report"
          },
          {
            "id": "p087",
            "name": "制罐成品入库记录表",
            "arch": "report"
          },
          {
            "id": "p088",
            "name": "报工未入库明细表",
            "arch": "form"
          },
          {
            "id": "p089",
            "name": "采购入库记录",
            "arch": "form"
          },
          {
            "id": "p090",
            "name": "采购退货记录",
            "arch": "form"
          },
          {
            "id": "p091",
            "name": "叉车成品上架记录",
            "arch": "list"
          },
          {
            "id": "p092",
            "name": "包材回收记录",
            "arch": "list"
          },
          {
            "id": "p093",
            "name": "预领物料锁定",
            "arch": "list"
          },
          {
            "id": "p094",
            "name": "领料单物料锁定",
            "arch": "form"
          },
          {
            "id": "p095",
            "name": "物料移动记录一步法",
            "arch": "list"
          },
          {
            "id": "p096",
            "name": "在途库存信息",
            "arch": "list"
          },
          {
            "id": "p097",
            "name": "库存数量锁定",
            "arch": "list"
          },
          {
            "id": "p098",
            "name": "可回收包材移动记录",
            "arch": "list"
          },
          {
            "id": "p099",
            "name": "灌装库存占用报表",
            "arch": "report"
          },
          {
            "id": "p100",
            "name": "库位看板报表",
            "arch": "dashboard"
          },
          {
            "id": "p101",
            "name": "销售发货记录",
            "arch": "form"
          },
          {
            "id": "p102",
            "name": "销售退货记录",
            "arch": "form"
          },
          {
            "id": "p103",
            "name": "库存呆滞报表",
            "arch": "report"
          },
          {
            "id": "p104",
            "name": "承运信息汇总",
            "arch": "report"
          },
          {
            "id": "p105",
            "name": "委外发货记录",
            "arch": "form"
          },
          {
            "id": "p106",
            "name": "安全库存水位管理",
            "arch": "list"
          },
          {
            "id": "p107",
            "name": "销售发货计划",
            "arch": "form"
          },
          {
            "id": "p108",
            "name": "生产预领信息",
            "arch": "list"
          },
          {
            "id": "p109",
            "name": "收发存记录",
            "arch": "list"
          },
          {
            "id": "p110",
            "name": "库存周转率看板数据",
            "arch": "dashboard"
          },
          {
            "id": "p111",
            "name": "客户包材台账管理",
            "arch": "list"
          },
          {
            "id": "p112",
            "name": "铜针铜线称重记录表",
            "arch": "report"
          },
          {
            "id": "p113",
            "name": "铜针委外收发货汇总表",
            "arch": "report"
          },
          {
            "id": "p114",
            "name": "铜线委外收货明细表",
            "arch": "form"
          },
          {
            "id": "p115",
            "name": "塑料栈板委外置换收货",
            "arch": "form"
          },
          {
            "id": "p116",
            "name": "塑料栈板委外置换发货",
            "arch": "form"
          },
          {
            "id": "p117",
            "name": "销售发货统计",
            "arch": "report"
          }
        ]
      }
    ]
  },
  {
    "id": "m2",
    "name": "计划管理",
    "groups": [
      {
        "name": "默认",
        "items": [
          {
            "id": "p124",
            "name": "制令单上线",
            "arch": "form"
          }
        ]
      },
      {
        "name": "信息查询",
        "items": [
          {
            "id": "p126",
            "name": "销售订单产量信息",
            "arch": "list"
          },
          {
            "id": "p127",
            "name": "工单投料信息",
            "arch": "list"
          },
          {
            "id": "p128",
            "name": "销售订单发货信息",
            "arch": "form"
          },
          {
            "id": "p129",
            "name": "制令单上线日志",
            "arch": "form"
          }
        ]
      }
    ]
  },
  {
    "id": "m3",
    "name": "生产管理",
    "groups": [
      {
        "name": "管理模型",
        "items": [
          {
            "id": "p130",
            "name": "车间建模",
            "arch": "config"
          },
          {
            "id": "p131",
            "name": "员工技能管理",
            "arch": "list"
          },
          {
            "id": "p132",
            "name": "员工作业权限",
            "arch": "config"
          },
          {
            "id": "p133",
            "name": "生产班组维护",
            "arch": "config"
          },
          {
            "id": "p134",
            "name": "制罐参数信息",
            "arch": "config"
          },
          {
            "id": "p135",
            "name": "人员安灯设置",
            "arch": "config"
          },
          {
            "id": "p136",
            "name": "班组早晚班维护",
            "arch": "config"
          }
        ]
      },
      {
        "name": "作业工作台",
        "items": [
          {
            "id": "prod-batchReport",
            "name": "批次报工",
            "arch": "form"
          },
          {
            "id": "prod-firstPass",
            "name": "首工序过站",
            "arch": "form"
          },
          {
            "id": "prod-midPass",
            "name": "中末工序过站",
            "arch": "form"
          },
          {
            "id": "prod-weighPass",
            "name": "称重过站",
            "arch": "form"
          }
        ]
      },
      {
        "name": "过程管控",
        "items": [
          {
            "id": "prod-ecn",
            "name": "ECN信息",
            "arch": "list"
          },
          {
            "id": "prod-invalidTime",
            "name": "无效时间",
            "arch": "report"
          },
          {
            "id": "prod-invalidTimeMgr",
            "name": "无效时间管理",
            "arch": "list"
          }
        ]
      },
      {
        "name": "默认",
        "items": [
          {
            "id": "prod-rework",
            "name": "返修管理",
            "arch": "form"
          }
        ]
      },
      {
        "name": "人员管理",
        "items": [
          {
            "id": "p144",
            "name": "在岗统计",
            "arch": "report"
          },
          {
            "id": "p145",
            "name": "葡萄图考核",
            "arch": "list"
          },
          {
            "id": "prod-weighInput",
            "name": "物料称重投入",
            "arch": "form"
          },
          {
            "id": "p171",
            "name": "合格证报工",
            "arch": "form"
          },
          {
            "id": "p172",
            "name": "报废称重产出",
            "arch": "form"
          },
          {
            "id": "p173",
            "name": "不良称重产出",
            "arch": "form"
          },
          {
            "id": "p174",
            "name": "首套备料配置",
            "arch": "config"
          },
          {
            "id": "p175",
            "name": "工站物料低位配置",
            "arch": "config"
          },
          {
            "id": "p176",
            "name": "数据采集过站设置",
            "arch": "iot"
          },
          {
            "id": "p177",
            "name": "交接班记录查询",
            "arch": "list"
          },
          {
            "id": "p178",
            "name": "彩印还原记录",
            "arch": "list"
          }
        ]
      },
      {
        "name": "信息查询",
        "items": [
          {
            "id": "p146",
            "name": "生产实时信息",
            "arch": "list"
          },
          {
            "id": "p147",
            "name": "工单生产实时信息",
            "arch": "list"
          },
          {
            "id": "p148",
            "name": "车间产量",
            "arch": "list"
          },
          {
            "id": "p149",
            "name": "线边仓物料",
            "arch": "list"
          },
          {
            "id": "p150",
            "name": "物料使用履历",
            "arch": "list"
          },
          {
            "id": "p163",
            "name": "合格证报工统计",
            "arch": "report"
          },
          {
            "id": "p164",
            "name": "车间物料汇总表",
            "arch": "report"
          },
          {
            "id": "p165",
            "name": "制令单对账表",
            "arch": "list"
          },
          {
            "id": "p166",
            "name": "投入产出对账表",
            "arch": "list"
          },
          {
            "id": "p167",
            "name": "工单金属平衡-生产",
            "arch": "list"
          },
          {
            "id": "p168",
            "name": "原材料投入回收日志",
            "arch": "list"
          }
        ]
      }
    ]
  },
  {
    "id": "m4",
    "name": "质量管理",
    "groups": [
      {
        "name": "基础数据",
        "items": [
          {
            "id": "p179",
            "name": "不良代码",
            "arch": "list"
          },
          {
            "id": "p183",
            "name": "MRB生成配置",
            "arch": "form"
          },
          {
            "id": "p184",
            "name": "NCR生成配置",
            "arch": "form"
          },
          {
            "id": "p185",
            "name": "SPC回传设置",
            "arch": "config"
          },
          {
            "id": "p186",
            "name": "COA模板配置",
            "arch": "config"
          },
          {
            "id": "p182",
            "name": "抽样方案设置",
            "arch": "config"
          }
        ]
      },
      {
        "name": "检验方案设置",
        "items": [
          {
            "id": "p187",
            "name": "检验项目",
            "arch": "list"
          },
          {
            "id": "p188",
            "name": "厂内抽样标准查询",
            "arch": "config"
          },
          {
            "id": "p189",
            "name": "检验项目模板",
            "arch": "config"
          },
          {
            "id": "p190",
            "name": "检验项目设置",
            "arch": "config"
          },
          {
            "id": "p191",
            "name": "检验项目类型",
            "arch": "config"
          },
          {
            "id": "p192",
            "name": "检验项目类型设置",
            "arch": "config"
          },
          {
            "id": "p194",
            "name": "IPQC巡检方案",
            "arch": "config"
          },
          {
            "id": "p198",
            "name": "首件检验方案",
            "arch": "config"
          },
          {
            "id": "p199",
            "name": "免检配置",
            "arch": "config"
          }
        ]
      },
      {
        "name": "检验执行",
        "items": [
          {
            "id": "p201",
            "name": "IQC检验",
            "arch": "list"
          },
          {
            "id": "p202",
            "name": "首件检验",
            "arch": "list"
          },
          {
            "id": "p203",
            "name": "IPQC检验",
            "arch": "list"
          },
          {
            "id": "p204",
            "name": "化学试剂使用查询",
            "arch": "list"
          },
          {
            "id": "p206",
            "name": "COA报告导出",
            "arch": "form"
          },
          {
            "id": "p207",
            "name": "自购料质检冲销",
            "arch": "form"
          }
        ]
      },
      {
        "name": "异常管理",
        "items": [
          {
            "id": "p208",
            "name": "MRB评审",
            "arch": "list"
          },
          {
            "id": "p209",
            "name": "生产冻结",
            "arch": "form"
          }
        ]
      },
      {
        "name": "检验信息查询",
        "items": [
          {
            "id": "p210",
            "name": "检验单信息",
            "arch": "list"
          },
          {
            "id": "p211",
            "name": "样本信息",
            "arch": "list"
          },
          {
            "id": "p212",
            "name": "样本检验记录",
            "arch": "list"
          },
          {
            "id": "p213",
            "name": "巡检对料记录",
            "arch": "list"
          }
        ]
      },
      {
        "name": "检验仪器管理",
        "items": [
          {
            "id": "p214",
            "name": "检验仪器建档",
            "arch": "config"
          },
          {
            "id": "p215",
            "name": "检验仪器校准",
            "arch": "list"
          },
          {
            "id": "p216",
            "name": "检验仪器处置",
            "arch": "list"
          }
        ]
      },
      {
        "name": "样品管理",
        "items": [
          {
            "id": "p217",
            "name": "理化样品查询",
            "arch": "list"
          },
          {
            "id": "p218",
            "name": "理化杀菌釜高温记录",
            "arch": "list"
          }
        ]
      },
      {
        "name": "质量报表",
        "items": [
          {
            "id": "p219",
            "name": "IQC检验记录单",
            "arch": "list"
          },
          {
            "id": "p220",
            "name": "首件检验记录单",
            "arch": "list"
          },
          {
            "id": "p221",
            "name": "IPQC检验记录单",
            "arch": "list"
          },
          {
            "id": "p222",
            "name": "彩印铁检验通知单",
            "arch": "list"
          },
          {
            "id": "p223",
            "name": "底盖检验通知单",
            "arch": "list"
          },
          {
            "id": "p224",
            "name": "易拉盖检验通知单",
            "arch": "list"
          },
          {
            "id": "p225",
            "name": "涂料检验通知单",
            "arch": "list"
          },
          {
            "id": "p226",
            "name": "稀释剂检验通知单",
            "arch": "list"
          },
          {
            "id": "p227",
            "name": "铜线检验通知单",
            "arch": "list"
          },
          {
            "id": "p228",
            "name": "其它检验通知单",
            "arch": "list"
          },
          {
            "id": "p229",
            "name": "COA明细报表",
            "arch": "report"
          },
          {
            "id": "p230",
            "name": "不良异常统计报表",
            "arch": "report"
          },
          {
            "id": "p231",
            "name": "品质管理部质量周报",
            "arch": "list"
          },
          {
            "id": "p232",
            "name": "品质管理部质量日报",
            "arch": "list"
          }
        ]
      },
      {
        "name": "化学品台账管理",
        "items": [
          {
            "id": "p233",
            "name": "化学品领用及试剂使用登记表",
            "arch": "list"
          },
          {
            "id": "p234",
            "name": "化学品入库记录",
            "arch": "form"
          },
          {
            "id": "p235",
            "name": "化学品领出台账",
            "arch": "list"
          }
        ]
      }
    ]
  },
  {
    "id": "m5",
    "name": "数据中心",
    "groups": [
      {
        "name": "仓库数据分析",
        "items": [
          {
            "id": "p236",
            "name": "库存周转率",
            "arch": "report"
          },
          {
            "id": "p237",
            "name": "库龄分布",
            "arch": "report"
          },
          {
            "id": "p238",
            "name": "呆滞周期分布",
            "arch": "report"
          },
          {
            "id": "p239",
            "name": "呆滞Top分析",
            "arch": "report"
          },
          {
            "id": "p240",
            "name": "采购退货率",
            "arch": "report"
          },
          {
            "id": "p241",
            "name": "销售退货率",
            "arch": "report"
          }
        ]
      },
      {
        "name": "质量数据分析",
        "items": [
          {
            "id": "p242",
            "name": "IQC检验批合格率",
            "arch": "report"
          },
          {
            "id": "p243",
            "name": "IQC样本不良率",
            "arch": "report"
          },
          {
            "id": "p244",
            "name": "IQC样本不良",
            "arch": "list"
          },
          {
            "id": "p245",
            "name": "首件检验样本不良率",
            "arch": "report"
          },
          {
            "id": "p246",
            "name": "首件检验样本不良",
            "arch": "list"
          },
          {
            "id": "p247",
            "name": "IPQC巡检检验批合格率",
            "arch": "report"
          },
          {
            "id": "p248",
            "name": "IPQC不合格巡检项目",
            "arch": "list"
          },
          {
            "id": "p249",
            "name": "IPQC巡检样本不良率",
            "arch": "report"
          },
          {
            "id": "p250",
            "name": "制程原材料使用异常",
            "arch": "list"
          }
        ]
      },
      {
        "name": "生产数据分析",
        "items": [
          {
            "id": "p251",
            "name": "物料损耗率",
            "arch": "report"
          },
          {
            "id": "p252",
            "name": "线体直通率",
            "arch": "report"
          },
          {
            "id": "p253",
            "name": "产量趋势汇总",
            "arch": "report"
          },
          {
            "id": "p254",
            "name": "产品在制信息",
            "arch": "list"
          },
          {
            "id": "p255",
            "name": "产品过站记录",
            "arch": "form"
          },
          {
            "id": "p256",
            "name": "半成品投入记录",
            "arch": "list"
          },
          {
            "id": "p257",
            "name": "原材料投入记录",
            "arch": "list"
          },
          {
            "id": "p258",
            "name": "在线物料记录",
            "arch": "list"
          },
          {
            "id": "p259",
            "name": "生产日报-损耗",
            "arch": "list"
          },
          {
            "id": "p260",
            "name": "每日线体产量",
            "arch": "list"
          },
          {
            "id": "p261",
            "name": "原材料投入日志",
            "arch": "list"
          },
          {
            "id": "p262",
            "name": "原材料投入日志新",
            "arch": "report"
          },
          {
            "id": "p263",
            "name": "物料回收日志新",
            "arch": "report"
          },
          {
            "id": "p264",
            "name": "物料回收日志",
            "arch": "list"
          },
          {
            "id": "p265",
            "name": "合格证报工记录",
            "arch": "form"
          },
          {
            "id": "p266",
            "name": "制令单投料追溯",
            "arch": "trace"
          },
          {
            "id": "p267",
            "name": "报废原因分布",
            "arch": "report"
          },
          {
            "id": "p268",
            "name": "罐身平衡报表",
            "arch": "report"
          },
          {
            "id": "p269",
            "name": "不良报废明细",
            "arch": "form"
          },
          {
            "id": "p270",
            "name": "不良报废汇总",
            "arch": "report"
          },
          {
            "id": "p271",
            "name": "并垛日志",
            "arch": "list"
          },
          {
            "id": "p272",
            "name": "待处理品转正常日志",
            "arch": "list"
          },
          {
            "id": "p273",
            "name": "损耗量",
            "arch": "list"
          },
          {
            "id": "p274",
            "name": "原材料万罐用量管理",
            "arch": "list"
          },
          {
            "id": "p275",
            "name": "设备故障时间分析",
            "arch": "report"
          },
          {
            "id": "p276",
            "name": "设备采集时间分布",
            "arch": "report"
          },
          {
            "id": "p277",
            "name": "日计划达成率",
            "arch": "report"
          },
          {
            "id": "p278",
            "name": "生产工装上下线",
            "arch": "list"
          },
          {
            "id": "p279",
            "name": "安灯发起记录",
            "arch": "list"
          },
          {
            "id": "p280",
            "name": "待处理品报工记录",
            "arch": "form"
          },
          {
            "id": "p281",
            "name": "报废汇总",
            "arch": "report"
          },
          {
            "id": "p282",
            "name": "生产效率报表",
            "arch": "report"
          },
          {
            "id": "p283",
            "name": "产线整体报表(ABDE)",
            "arch": "report"
          },
          {
            "id": "p284",
            "name": "线体实际生产工时",
            "arch": "list"
          },
          {
            "id": "p285",
            "name": "生产效率综合报表",
            "arch": "report"
          },
          {
            "id": "p286",
            "name": "报废条码删除记录",
            "arch": "form"
          },
          {
            "id": "p287",
            "name": "生产综合明细报表",
            "arch": "report"
          }
        ]
      },
      {
        "name": "默认",
        "items": [
          {
            "id": "prod-downtime",
            "name": "设备异常停机工时汇总",
            "arch": "report"
          }
        ]
      },
      {
        "name": "数字大屏看板",
        "items": [
          {
            "id": "p288",
            "name": "IQC看板",
            "arch": "dashboard"
          },
          {
            "id": "p289",
            "name": "出货看板",
            "arch": "dashboard"
          },
          {
            "id": "p290",
            "name": "车间看板（新）",
            "arch": "dashboard"
          },
          {
            "id": "p291",
            "name": "盘点看板",
            "arch": "dashboard"
          },
          {
            "id": "p292",
            "name": "线体看板",
            "arch": "dashboard"
          },
          {
            "id": "p293",
            "name": "车间叫料看板",
            "arch": "dashboard"
          },
          {
            "id": "p294",
            "name": "看板位置维护",
            "arch": "dashboard"
          },
          {
            "id": "p295",
            "name": "仓库发货看板",
            "arch": "dashboard"
          },
          {
            "id": "p296",
            "name": "库位看板(原料仓)",
            "arch": "dashboard"
          },
          {
            "id": "p297",
            "name": "IQC看板",
            "arch": "dashboard"
          },
          {
            "id": "p298",
            "name": "仓库看板新",
            "arch": "dashboard"
          },
          {
            "id": "p299",
            "name": "制罐线体看板A",
            "arch": "dashboard"
          },
          {
            "id": "p300",
            "name": "制罐线体看板B",
            "arch": "dashboard"
          },
          {
            "id": "p301",
            "name": "制罐线体看板D",
            "arch": "dashboard"
          },
          {
            "id": "p302",
            "name": "制罐线体看板E",
            "arch": "dashboard"
          },
          {
            "id": "p303",
            "name": "生产综合管理看板新",
            "arch": "dashboard"
          },
          {
            "id": "p304",
            "name": "品质综合看板新",
            "arch": "dashboard"
          },
          {
            "id": "p305",
            "name": "测试分析报表",
            "arch": "report"
          }
        ]
      },
      {
        "name": "信息追溯",
        "items": [
          {
            "id": "p306",
            "name": "产品追溯",
            "arch": "trace"
          },
          {
            "id": "p307",
            "name": "物料追溯",
            "arch": "trace"
          },
          {
            "id": "p308",
            "name": "单据产品追溯",
            "arch": "trace"
          },
          {
            "id": "p309",
            "name": "物料作业履历",
            "arch": "list"
          },
          {
            "id": "p310",
            "name": "作业错误日志",
            "arch": "list"
          },
          {
            "id": "p311",
            "name": "接口日志查询",
            "arch": "list"
          },
          {
            "id": "p312",
            "name": "SAP接口日志",
            "arch": "list"
          },
          {
            "id": "p313",
            "name": "定时任务日志",
            "arch": "list"
          }
        ]
      },
      {
        "name": "IOT采集数据",
        "items": [
          {
            "id": "p317",
            "name": "设备采集数据",
            "arch": "iot"
          },
          {
            "id": "p318",
            "name": "电表数据报表",
            "arch": "report"
          },
          {
            "id": "p319",
            "name": "光检机不良信息",
            "arch": "list"
          },
          {
            "id": "p320",
            "name": "设备实时状态",
            "arch": "iot"
          },
          {
            "id": "p321",
            "name": "能耗明细表",
            "arch": "list"
          }
        ]
      }
    ]
  },
  {
    "id": "m6",
    "name": "设备管理",
    "groups": [
      {
        "name": "配置中心",
        "items": [
          { "id": "eq-team", "name": "班组管理", "arch": "config" },
          { "id": "eq-bom", "name": "设备BOM", "arch": "config" },
          { "id": "eq-faultList", "name": "故障明细表", "arch": "list" },
          { "id": "eq-eqTypePart", "name": "设备类型部位", "arch": "config" }
        ]
      },
      {
        "name": "资产管理",
        "items": [
          { "id": "eq-ledger", "name": "设备台账", "arch": "list" }
        ]
      },
      {
        "name": "维保管理",
        "items": [
          { "id": "eq-maintainPlan", "name": "保养计划", "arch": "list" },
          { "id": "eq-checkPlan", "name": "检验计划", "arch": "list" },
          { "id": "eq-maintain", "name": "设备保养", "arch": "form" },
          { "id": "eq-inspect", "name": "设备点检/巡检", "arch": "form" },
          { "id": "eq-repair", "name": "设备维修", "arch": "form" },
          { "id": "eq-kbList", "name": "维修知识库", "arch": "list" }
        ]
      },
      {
        "name": "备件管理",
        "items": [
          { "id": "eq-sparePurchase", "name": "备件采购", "arch": "form" },
          { "id": "eq-spareIn", "name": "备件入库", "arch": "form" },
          { "id": "eq-spareStock", "name": "备件库存", "arch": "list" },
          { "id": "eq-spareCheck", "name": "备件盘点", "arch": "form" },
          { "id": "eq-spareUse", "name": "备件领用", "arch": "form" },
          { "id": "eq-keyComp", "name": "关键组件", "arch": "list" }
        ]
      },
      {
        "name": "工装管理",
        "items": [
          { "id": "eq-toolArchive", "name": "工装建档", "arch": "config" },
          { "id": "eq-toolLedger", "name": "工装台账", "arch": "list" },
          { "id": "eq-toolScrap", "name": "工装报废", "arch": "form" },
          { "id": "eq-toolHistory", "name": "工装履历", "arch": "list" }
        ]
      },
      {
        "name": "数据分析",
        "items": [
          { "id": "eq-home", "name": "设备管理首页", "arch": "dashboard" },
          { "id": "eq-board", "name": "设备管理看板", "arch": "dashboard" },
          { "id": "eq-mttr", "name": "MTTR", "arch": "report" },
          { "id": "eq-mtbf", "name": "MTBF", "arch": "report" },
          { "id": "eq-energy", "name": "能耗明细表", "arch": "list" }
        ]
      }
    ]
  }
];

export const MOM_IMPORTED_LEAVES: Record<string, MomLeafMeta> = {
  "p001": {
    "id": "p001",
    "name": "多语言配置",
    "module": "配置中心",
    "group": "系统基础",
    "path": "配置中心/系统基础/多语言配置",
    "arch": "config"
  },
  "p002": {
    "id": "p002",
    "name": "数据字典",
    "module": "配置中心",
    "group": "系统基础",
    "path": "配置中心/系统基础/数据字典",
    "arch": "config"
  },
  "p003": {
    "id": "p003",
    "name": "数采设备信息",
    "module": "配置中心",
    "group": "系统基础",
    "path": "配置中心/系统基础/数采设备信息",
    "arch": "list"
  },
  "p004": {
    "id": "p004",
    "name": "物料信息",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/物料信息",
    "arch": "list"
  },
  "p005": {
    "id": "p005",
    "name": "产品BOM信息",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/产品BOM信息",
    "arch": "config"
  },
  "p006": {
    "id": "p006",
    "name": "替代料设置",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/替代料设置",
    "arch": "config"
  },
  "p007": {
    "id": "p007",
    "name": "销售BOM信息",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/销售BOM信息",
    "arch": "config"
  },
  "p008": {
    "id": "p008",
    "name": "工序信息",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/基础工艺/工序信息",
    "arch": "config"
  },
  "p009": {
    "id": "p009",
    "name": "工艺路线",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/基础工艺/工艺路线",
    "arch": "config"
  },
  "p011": {
    "id": "p011",
    "name": "工艺参数",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/基础工艺/工艺参数",
    "arch": "config"
  },
  "p012": {
    "id": "p012",
    "name": "工艺参数文件",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/基础工艺/工艺参数文件",
    "arch": "config"
  },
  "p014": {
    "id": "p014",
    "name": "生产节拍",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/关键工艺/生产节拍",
    "arch": "list"
  },
  "p020": {
    "id": "p020",
    "name": "关键物料",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/关键物料/关键物料",
    "arch": "list"
  },
  "p021": {
    "id": "p021",
    "name": "E-SOP文件信息",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/ESOP管理/E-SOP文件信息",
    "arch": "list"
  },
  "p022": {
    "id": "p022",
    "name": "E-SOP文件配置",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/ESOP管理/E-SOP文件配置",
    "arch": "config"
  },
  "p023": {
    "id": "p023",
    "name": "E-SOP产品配置",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/ESOP管理/E-SOP产品配置",
    "arch": "config"
  },
  "p024": {
    "id": "p024",
    "name": "E-SOP履历信息",
    "module": "配置中心",
    "group": "物料基础",
    "path": "配置中心/物料基础/工艺管理/ESOP管理/E-SOP履历信息",
    "arch": "list"
  },
  "p027": {
    "id": "p027",
    "name": "供应商信息",
    "module": "配置中心",
    "group": "业务基础",
    "path": "配置中心/业务基础/供应商信息",
    "arch": "list"
  },
  "p028": {
    "id": "p028",
    "name": "客户信息",
    "module": "配置中心",
    "group": "业务基础",
    "path": "配置中心/业务基础/客户信息",
    "arch": "list"
  },
  "p029": {
    "id": "p029",
    "name": "模板设计",
    "module": "配置中心",
    "group": "业务基础",
    "path": "配置中心/业务基础/模板设计",
    "arch": "config"
  },
  "p030": {
    "id": "p030",
    "name": "看板配置",
    "module": "配置中心",
    "group": "业务基础",
    "path": "配置中心/业务基础/看板配置",
    "arch": "dashboard"
  },
  "p032": {
    "id": "p032",
    "name": "成本中心",
    "module": "配置中心",
    "group": "业务基础",
    "path": "配置中心/业务基础/成本中心",
    "arch": "list"
  },
  "p033": {
    "id": "p033",
    "name": "条码生成变量",
    "module": "配置中心",
    "group": "条码基础",
    "path": "配置中心/条码基础/条码生成变量",
    "arch": "form"
  },
  "p034": {
    "id": "p034",
    "name": "条码生成配置",
    "module": "配置中心",
    "group": "条码基础",
    "path": "配置中心/条码基础/条码生成配置",
    "arch": "form"
  },
  "p035": {
    "id": "p035",
    "name": "条码校验规则",
    "module": "配置中心",
    "group": "条码基础",
    "path": "配置中心/条码基础/条码校验规则",
    "arch": "config"
  },
  "p036": {
    "id": "p036",
    "name": "仓库建模",
    "module": "仓库管理",
    "group": "管理模型",
    "path": "仓库管理/管理模型/仓库建模",
    "arch": "config"
  },
  "p038": {
    "id": "p038",
    "name": "单据类型",
    "module": "仓库管理",
    "group": "管理模型",
    "path": "仓库管理/管理模型/单据类型",
    "arch": "config"
  },
  "p039": {
    "id": "p039",
    "name": "仓库存储策略",
    "module": "仓库管理",
    "group": "管理模型",
    "path": "仓库管理/管理模型/仓库存储策略",
    "arch": "list"
  },
  "p041": {
    "id": "p041",
    "name": "拣货方案信息",
    "module": "仓库管理",
    "group": "管理模型",
    "path": "仓库管理/管理模型/拣货方案信息",
    "arch": "config"
  },
  "p042": {
    "id": "p042",
    "name": "拣货方案",
    "module": "仓库管理",
    "group": "管理模型",
    "path": "仓库管理/管理模型/拣货方案",
    "arch": "config"
  },
  "p046": {
    "id": "p046",
    "name": "叉车信息维护",
    "module": "仓库管理",
    "group": "管理模型",
    "path": "仓库管理/管理模型/叉车信息维护",
    "arch": "config"
  },
  "p048": {
    "id": "p048",
    "name": "采购订单",
    "module": "仓库管理",
    "group": "采购管理",
    "path": "仓库管理/采购管理/采购订单",
    "arch": "list"
  },
  "p049": {
    "id": "p049",
    "name": "预先发货清单",
    "module": "仓库管理",
    "group": "采购管理",
    "path": "仓库管理/采购管理/预先发货清单",
    "arch": "form"
  },
  "p050": {
    "id": "p050",
    "name": "采购入库",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/采购入库",
    "arch": "form"
  },
  "p051": {
    "id": "p051",
    "name": "完工入库",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/完工入库",
    "arch": "form"
  },
  "p052": {
    "id": "p052",
    "name": "生产退料",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/生产退料",
    "arch": "list"
  },
  "p053": {
    "id": "p053",
    "name": "其他入库",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/其他入库",
    "arch": "form"
  },
  "p054": {
    "id": "p054",
    "name": "销售退货",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/销售退货",
    "arch": "form"
  },
  "p055": {
    "id": "p055",
    "name": "废品入库",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/废品入库",
    "arch": "form"
  },
  "p056": {
    "id": "p056",
    "name": "杂收入库",
    "module": "仓库管理",
    "group": "入库作业",
    "path": "仓库管理/入库作业/杂收入库",
    "arch": "form"
  },
  "p057": {
    "id": "p057",
    "name": "库存盘点",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/库存盘点",
    "arch": "form"
  },
  "p058": {
    "id": "p058",
    "name": "盘点作业",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/盘点作业",
    "arch": "form"
  },
  "p059": {
    "id": "p059",
    "name": "库存冻结",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/库存冻结",
    "arch": "form"
  },
  "p060": {
    "id": "p060",
    "name": "库存报废",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/库存报废",
    "arch": "form"
  },
  "p061": {
    "id": "p061",
    "name": "来料打印",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/来料打印",
    "arch": "form"
  },
  "p062": {
    "id": "p062",
    "name": "批次物料出入库",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/批次物料出入库",
    "arch": "form"
  },
  "p063": {
    "id": "p063",
    "name": "物料移动记录",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/物料移动记录",
    "arch": "list"
  },
  "p065": {
    "id": "p065",
    "name": "库位移动",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/库位移动",
    "arch": "list"
  },
  "p066": {
    "id": "p066",
    "name": "无码物料移动",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/无码物料移动",
    "arch": "list"
  },
  "p067": {
    "id": "p067",
    "name": "库存盘点表",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/库存盘点表",
    "arch": "form"
  },
  "p068": {
    "id": "p068",
    "name": "生产废铁分摊",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/生产废铁分摊",
    "arch": "list"
  },
  "p069": {
    "id": "p069",
    "name": "仓库盘点",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/仓库盘点",
    "arch": "form"
  },
  "p070": {
    "id": "p070",
    "name": "呆滞料报废",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/呆滞料报废",
    "arch": "form"
  },
  "p071": {
    "id": "p071",
    "name": "客户报废作业",
    "module": "仓库管理",
    "group": "库内作业",
    "path": "仓库管理/库内作业/客户报废作业",
    "arch": "form"
  },
  "p072": {
    "id": "p072",
    "name": "生产领料",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/生产领料",
    "arch": "form"
  },
  "p073": {
    "id": "p073",
    "name": "销售发货",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/销售发货",
    "arch": "form"
  },
  "p074": {
    "id": "p074",
    "name": "其他出库",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/其他出库",
    "arch": "form"
  },
  "p075": {
    "id": "p075",
    "name": "采购退料",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/采购退料",
    "arch": "list"
  },
  "p076": {
    "id": "p076",
    "name": "承运商路线",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/承运商路线",
    "arch": "config"
  },
  "p077": {
    "id": "p077",
    "name": "废品销售发货",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/废品销售发货",
    "arch": "form"
  },
  "p078": {
    "id": "p078",
    "name": "生产领料审核",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/生产领料审核",
    "arch": "form"
  },
  "p079": {
    "id": "p079",
    "name": "杂发出库",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/杂发出库",
    "arch": "form"
  },
  "p080": {
    "id": "p080",
    "name": "出货单打印",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/出货单打印",
    "arch": "form"
  },
  "p081": {
    "id": "p081",
    "name": "公司间销售发货单",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/公司间销售发货单",
    "arch": "form"
  },
  "p082": {
    "id": "p082",
    "name": "内部交易退货",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/出库作业/内部交易退货",
    "arch": "form"
  },
  "p083": {
    "id": "p083",
    "name": "调拨作业",
    "module": "仓库管理",
    "group": "出库作业",
    "path": "仓库管理/调拨作业",
    "arch": "form"
  },
  "p084": {
    "id": "p084",
    "name": "实时库存",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/实时库存",
    "arch": "list"
  },
  "p085": {
    "id": "p085",
    "name": "SAP库存",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/SAP库存",
    "arch": "list"
  },
  "p086": {
    "id": "p086",
    "name": "销售发货统计表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/销售发货统计表",
    "arch": "report"
  },
  "p087": {
    "id": "p087",
    "name": "制罐成品入库记录表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/制罐成品入库记录表",
    "arch": "report"
  },
  "p088": {
    "id": "p088",
    "name": "报工未入库明细表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/报工未入库明细表",
    "arch": "form"
  },
  "p089": {
    "id": "p089",
    "name": "采购入库记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/采购入库记录",
    "arch": "form"
  },
  "p090": {
    "id": "p090",
    "name": "采购退货记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/采购退货记录",
    "arch": "form"
  },
  "p091": {
    "id": "p091",
    "name": "叉车成品上架记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/叉车成品上架记录",
    "arch": "list"
  },
  "p092": {
    "id": "p092",
    "name": "包材回收记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/包材回收记录",
    "arch": "list"
  },
  "p093": {
    "id": "p093",
    "name": "预领物料锁定",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/预领物料锁定",
    "arch": "list"
  },
  "p094": {
    "id": "p094",
    "name": "领料单物料锁定",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/领料单物料锁定",
    "arch": "form"
  },
  "p095": {
    "id": "p095",
    "name": "物料移动记录一步法",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/物料移动记录一步法",
    "arch": "list"
  },
  "p096": {
    "id": "p096",
    "name": "在途库存信息",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/在途库存信息",
    "arch": "list"
  },
  "p097": {
    "id": "p097",
    "name": "库存数量锁定",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/库存数量锁定",
    "arch": "list"
  },
  "p098": {
    "id": "p098",
    "name": "可回收包材移动记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/可回收包材移动记录",
    "arch": "list"
  },
  "p099": {
    "id": "p099",
    "name": "灌装库存占用报表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/灌装库存占用报表",
    "arch": "report"
  },
  "p100": {
    "id": "p100",
    "name": "库位看板报表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/库位看板报表",
    "arch": "dashboard"
  },
  "p101": {
    "id": "p101",
    "name": "销售发货记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/销售发货记录",
    "arch": "form"
  },
  "p102": {
    "id": "p102",
    "name": "销售退货记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/销售退货记录",
    "arch": "form"
  },
  "p103": {
    "id": "p103",
    "name": "库存呆滞报表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/库存呆滞报表",
    "arch": "report"
  },
  "p104": {
    "id": "p104",
    "name": "承运信息汇总",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/承运信息汇总",
    "arch": "report"
  },
  "p105": {
    "id": "p105",
    "name": "委外发货记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/委外发货记录",
    "arch": "form"
  },
  "p106": {
    "id": "p106",
    "name": "安全库存水位管理",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/安全库存水位管理",
    "arch": "list"
  },
  "p107": {
    "id": "p107",
    "name": "销售发货计划",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/销售发货计划",
    "arch": "form"
  },
  "p108": {
    "id": "p108",
    "name": "生产预领信息",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/生产预领信息",
    "arch": "list"
  },
  "p109": {
    "id": "p109",
    "name": "收发存记录",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/收发存记录",
    "arch": "list"
  },
  "p110": {
    "id": "p110",
    "name": "库存周转率看板数据",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/库存周转率看板数据",
    "arch": "dashboard"
  },
  "p111": {
    "id": "p111",
    "name": "客户包材台账管理",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/客户包材台账管理",
    "arch": "list"
  },
  "p112": {
    "id": "p112",
    "name": "铜针铜线称重记录表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/铜针铜线称重记录表",
    "arch": "report"
  },
  "p113": {
    "id": "p113",
    "name": "铜针委外收发货汇总表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/铜针委外收发货汇总表",
    "arch": "report"
  },
  "p114": {
    "id": "p114",
    "name": "铜线委外收货明细表",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/铜线委外收货明细表",
    "arch": "form"
  },
  "p115": {
    "id": "p115",
    "name": "塑料栈板委外置换收货",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/塑料栈板委外置换收货",
    "arch": "form"
  },
  "p116": {
    "id": "p116",
    "name": "塑料栈板委外置换发货",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/塑料栈板委外置换发货",
    "arch": "form"
  },
  "p117": {
    "id": "p117",
    "name": "销售发货统计",
    "module": "仓库管理",
    "group": "信息查询",
    "path": "仓库管理/信息查询/销售发货统计",
    "arch": "report"
  },
  "p124": {
    "id": "p124",
    "name": "制令单上线",
    "module": "计划管理",
    "group": "默认",
    "path": "计划管理/制令单上线",
    "arch": "form"
  },
  "p126": {
    "id": "p126",
    "name": "销售订单产量信息",
    "module": "计划管理",
    "group": "信息查询",
    "path": "计划管理/信息查询/销售订单产量信息",
    "arch": "list"
  },
  "p127": {
    "id": "p127",
    "name": "工单投料信息",
    "module": "计划管理",
    "group": "信息查询",
    "path": "计划管理/信息查询/工单投料信息",
    "arch": "list"
  },
  "p128": {
    "id": "p128",
    "name": "销售订单发货信息",
    "module": "计划管理",
    "group": "信息查询",
    "path": "计划管理/信息查询/销售订单发货信息",
    "arch": "form"
  },
  "p129": {
    "id": "p129",
    "name": "制令单上线日志",
    "module": "计划管理",
    "group": "信息查询",
    "path": "计划管理/信息查询/制令单上线日志",
    "arch": "form"
  },
  "p130": {
    "id": "p130",
    "name": "车间建模",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/车间建模",
    "arch": "config"
  },
  "p131": {
    "id": "p131",
    "name": "员工技能管理",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/员工技能管理",
    "arch": "list"
  },
  "p132": {
    "id": "p132",
    "name": "员工作业权限",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/员工作业权限",
    "arch": "config"
  },
  "p133": {
    "id": "p133",
    "name": "生产班组维护",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/生产班组维护",
    "arch": "config"
  },
  "p134": {
    "id": "p134",
    "name": "制罐参数信息",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/制罐参数信息",
    "arch": "config"
  },
  "p135": {
    "id": "p135",
    "name": "人员安灯设置",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/人员安灯设置",
    "arch": "config"
  },
  "p136": {
    "id": "p136",
    "name": "班组早晚班维护",
    "module": "生产管理",
    "group": "管理模型",
    "path": "生产管理/管理模型/班组早晚班维护",
    "arch": "config"
  },
  "p144": {
    "id": "p144",
    "name": "在岗统计",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/在岗统计",
    "arch": "report"
  },
  "p145": {
    "id": "p145",
    "name": "葡萄图考核",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/葡萄图考核",
    "arch": "list"
  },
  "p146": {
    "id": "p146",
    "name": "生产实时信息",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/生产实时信息",
    "arch": "list"
  },
  "p147": {
    "id": "p147",
    "name": "工单生产实时信息",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/工单生产实时信息",
    "arch": "list"
  },
  "p148": {
    "id": "p148",
    "name": "车间产量",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/车间产量",
    "arch": "list"
  },
  "p149": {
    "id": "p149",
    "name": "线边仓物料",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/线边仓物料",
    "arch": "list"
  },
  "p150": {
    "id": "p150",
    "name": "物料使用履历",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/物料使用履历",
    "arch": "list"
  },
  "p163": {
    "id": "p163",
    "name": "合格证报工统计",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/合格证报工统计",
    "arch": "report"
  },
  "p164": {
    "id": "p164",
    "name": "车间物料汇总表",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/车间物料汇总表",
    "arch": "report"
  },
  "p165": {
    "id": "p165",
    "name": "制令单对账表",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/制令单对账表",
    "arch": "list"
  },
  "p166": {
    "id": "p166",
    "name": "投入产出对账表",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/投入产出对账表",
    "arch": "list"
  },
  "p167": {
    "id": "p167",
    "name": "工单金属平衡-生产",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/工单金属平衡-生产",
    "arch": "list"
  },
  "p168": {
    "id": "p168",
    "name": "原材料投入回收日志",
    "module": "生产管理",
    "group": "信息查询",
    "path": "生产管理/信息查询/原材料投入回收日志",
    "arch": "list"
  },
  "p171": {
    "id": "p171",
    "name": "合格证报工",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/合格证报工",
    "arch": "form"
  },
  "p172": {
    "id": "p172",
    "name": "报废称重产出",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/报废称重产出",
    "arch": "form"
  },
  "p173": {
    "id": "p173",
    "name": "不良称重产出",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/不良称重产出",
    "arch": "form"
  },
  "p175": {
    "id": "p175",
    "name": "工站物料低位配置",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/工站物料低位配置",
    "arch": "config"
  },
  "p176": {
    "id": "p176",
    "name": "数据采集过站设置",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/数据采集过站设置",
    "arch": "iot"
  },
  "p177": {
    "id": "p177",
    "name": "交接班记录查询",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/交接班记录查询",
    "arch": "list"
  },
  "p178": {
    "id": "p178",
    "name": "彩印还原记录",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/彩印还原记录",
    "arch": "list"
  },
  "p174": {
    "id": "p174",
    "name": "首套备料配置",
    "module": "生产管理",
    "group": "人员管理",
    "path": "生产管理/人员管理/首套备料配置",
    "arch": "config"
  },
  "p179": {
    "id": "p179",
    "name": "不良代码",
    "module": "质量管理",
    "group": "基础数据",
    "path": "质量管理/基础数据/不良代码",
    "arch": "list"
  },
  "p183": {
    "id": "p183",
    "name": "MRB生成配置",
    "module": "质量管理",
    "group": "基础数据",
    "path": "质量管理/基础数据/MRB生成配置",
    "arch": "form"
  },
  "p184": {
    "id": "p184",
    "name": "NCR生成配置",
    "module": "质量管理",
    "group": "基础数据",
    "path": "质量管理/基础数据/NCR生成配置",
    "arch": "form"
  },
  "p185": {
    "id": "p185",
    "name": "SPC回传设置",
    "module": "质量管理",
    "group": "基础数据",
    "path": "质量管理/基础数据/SPC回传设置",
    "arch": "config"
  },
  "p186": {
    "id": "p186",
    "name": "COA模板配置",
    "module": "质量管理",
    "group": "基础数据",
    "path": "质量管理/基础数据/COA模板配置",
    "arch": "config"
  },
  "p182": {
    "id": "p182",
    "name": "抽样方案设置",
    "module": "质量管理",
    "group": "基础数据",
    "path": "质量管理/基础数据/抽样方案设置",
    "arch": "config"
  },
  "p187": {
    "id": "p187",
    "name": "检验项目",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/检验项目",
    "arch": "list"
  },
  "p188": {
    "id": "p188",
    "name": "厂内抽样标准查询",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/厂内抽样标准查询",
    "arch": "config"
  },
  "p189": {
    "id": "p189",
    "name": "检验项目模板",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/检验项目模板",
    "arch": "config"
  },
  "p190": {
    "id": "p190",
    "name": "检验项目设置",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/检验项目设置",
    "arch": "config"
  },
  "p191": {
    "id": "p191",
    "name": "检验项目类型",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/检验项目类型",
    "arch": "config"
  },
  "p192": {
    "id": "p192",
    "name": "检验项目类型设置",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/检验项目类型设置",
    "arch": "config"
  },
  "p194": {
    "id": "p194",
    "name": "IPQC巡检方案",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/IPQC巡检方案",
    "arch": "config"
  },
  "p198": {
    "id": "p198",
    "name": "首件检验方案",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/首件检验方案",
    "arch": "config"
  },
  "p199": {
    "id": "p199",
    "name": "免检配置",
    "module": "质量管理",
    "group": "检验方案设置",
    "path": "质量管理/检验方案设置/免检配置",
    "arch": "config"
  },
  "p201": {
    "id": "p201",
    "name": "IQC检验",
    "module": "质量管理",
    "group": "检验执行",
    "path": "质量管理/检验执行/IQC检验",
    "arch": "list"
  },
  "p202": {
    "id": "p202",
    "name": "首件检验",
    "module": "质量管理",
    "group": "检验执行",
    "path": "质量管理/检验执行/首件检验",
    "arch": "list"
  },
  "p203": {
    "id": "p203",
    "name": "IPQC检验",
    "module": "质量管理",
    "group": "检验执行",
    "path": "质量管理/检验执行/IPQC检验",
    "arch": "list"
  },
  "p204": {
    "id": "p204",
    "name": "化学试剂使用查询",
    "module": "质量管理",
    "group": "检验执行",
    "path": "质量管理/检验执行/化学试剂使用查询",
    "arch": "list"
  },
  "p206": {
    "id": "p206",
    "name": "COA报告导出",
    "module": "质量管理",
    "group": "检验执行",
    "path": "质量管理/检验执行/COA报告导出",
    "arch": "form"
  },
  "p207": {
    "id": "p207",
    "name": "自购料质检冲销",
    "module": "质量管理",
    "group": "检验执行",
    "path": "质量管理/检验执行/自购料质检冲销",
    "arch": "form"
  },
  "p208": {
    "id": "p208",
    "name": "MRB评审",
    "module": "质量管理",
    "group": "异常管理",
    "path": "质量管理/异常管理/MRB评审",
    "arch": "list"
  },
  "p209": {
    "id": "p209",
    "name": "生产冻结",
    "module": "质量管理",
    "group": "异常管理",
    "path": "质量管理/异常管理/生产冻结",
    "arch": "form"
  },
  "p210": {
    "id": "p210",
    "name": "检验单信息",
    "module": "质量管理",
    "group": "检验信息查询",
    "path": "质量管理/检验信息查询/检验单信息",
    "arch": "list"
  },
  "p211": {
    "id": "p211",
    "name": "样本信息",
    "module": "质量管理",
    "group": "检验信息查询",
    "path": "质量管理/检验信息查询/样本信息",
    "arch": "list"
  },
  "p212": {
    "id": "p212",
    "name": "样本检验记录",
    "module": "质量管理",
    "group": "检验信息查询",
    "path": "质量管理/检验信息查询/样本检验记录",
    "arch": "list"
  },
  "p213": {
    "id": "p213",
    "name": "巡检对料记录",
    "module": "质量管理",
    "group": "检验信息查询",
    "path": "质量管理/检验信息查询/巡检对料记录",
    "arch": "list"
  },
  "p214": {
    "id": "p214",
    "name": "检验仪器建档",
    "module": "质量管理",
    "group": "检验仪器管理",
    "path": "质量管理/检验仪器管理/检验仪器建档",
    "arch": "config"
  },
  "p215": {
    "id": "p215",
    "name": "检验仪器校准",
    "module": "质量管理",
    "group": "检验仪器管理",
    "path": "质量管理/检验仪器管理/检验仪器校准",
    "arch": "list"
  },
  "p216": {
    "id": "p216",
    "name": "检验仪器处置",
    "module": "质量管理",
    "group": "检验仪器管理",
    "path": "质量管理/检验仪器管理/检验仪器处置",
    "arch": "list"
  },
  "p217": {
    "id": "p217",
    "name": "理化样品查询",
    "module": "质量管理",
    "group": "样品管理",
    "path": "质量管理/样品管理/理化样品查询",
    "arch": "list"
  },
  "p218": {
    "id": "p218",
    "name": "理化杀菌釜高温记录",
    "module": "质量管理",
    "group": "样品管理",
    "path": "质量管理/样品管理/理化杀菌釜高温记录",
    "arch": "list"
  },
  "p219": {
    "id": "p219",
    "name": "IQC检验记录单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/IQC检验记录单",
    "arch": "list"
  },
  "p220": {
    "id": "p220",
    "name": "首件检验记录单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/首件检验记录单",
    "arch": "list"
  },
  "p221": {
    "id": "p221",
    "name": "IPQC检验记录单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/IPQC检验记录单",
    "arch": "list"
  },
  "p222": {
    "id": "p222",
    "name": "彩印铁检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/彩印铁检验通知单",
    "arch": "list"
  },
  "p223": {
    "id": "p223",
    "name": "底盖检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/底盖检验通知单",
    "arch": "list"
  },
  "p224": {
    "id": "p224",
    "name": "易拉盖检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/易拉盖检验通知单",
    "arch": "list"
  },
  "p225": {
    "id": "p225",
    "name": "涂料检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/涂料检验通知单",
    "arch": "list"
  },
  "p226": {
    "id": "p226",
    "name": "稀释剂检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/稀释剂检验通知单",
    "arch": "list"
  },
  "p227": {
    "id": "p227",
    "name": "铜线检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/铜线检验通知单",
    "arch": "list"
  },
  "p228": {
    "id": "p228",
    "name": "其它检验通知单",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/其它检验通知单",
    "arch": "list"
  },
  "p229": {
    "id": "p229",
    "name": "COA明细报表",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/COA明细报表",
    "arch": "report"
  },
  "p230": {
    "id": "p230",
    "name": "不良异常统计报表",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/质量报表/不良异常统计报表",
    "arch": "report"
  },
  "p231": {
    "id": "p231",
    "name": "品质管理部质量周报",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/品质管理部质量周报",
    "arch": "list"
  },
  "p232": {
    "id": "p232",
    "name": "品质管理部质量日报",
    "module": "质量管理",
    "group": "质量报表",
    "path": "质量管理/品质管理部质量日报",
    "arch": "list"
  },
  "p233": {
    "id": "p233",
    "name": "化学品领用及试剂使用登记表",
    "module": "质量管理",
    "group": "化学品台账管理",
    "path": "质量管理/化学品台账管理/化学品领用及试剂使用登记表",
    "arch": "list"
  },
  "p234": {
    "id": "p234",
    "name": "化学品入库记录",
    "module": "质量管理",
    "group": "化学品台账管理",
    "path": "质量管理/化学品台账管理/化学品入库记录",
    "arch": "form"
  },
  "p235": {
    "id": "p235",
    "name": "化学品领出台账",
    "module": "质量管理",
    "group": "化学品台账管理",
    "path": "质量管理/化学品台账管理/化学品领出台账",
    "arch": "list"
  },
  "p236": {
    "id": "p236",
    "name": "库存周转率",
    "module": "数据中心",
    "group": "仓库数据分析",
    "path": "数据中心/仓库数据分析/库存周转率",
    "arch": "report"
  },
  "p237": {
    "id": "p237",
    "name": "库龄分布",
    "module": "数据中心",
    "group": "仓库数据分析",
    "path": "数据中心/仓库数据分析/库龄分布",
    "arch": "report"
  },
  "p238": {
    "id": "p238",
    "name": "呆滞周期分布",
    "module": "数据中心",
    "group": "仓库数据分析",
    "path": "数据中心/仓库数据分析/呆滞周期分布",
    "arch": "report"
  },
  "p239": {
    "id": "p239",
    "name": "呆滞Top分析",
    "module": "数据中心",
    "group": "仓库数据分析",
    "path": "数据中心/仓库数据分析/呆滞Top分析",
    "arch": "report"
  },
  "p240": {
    "id": "p240",
    "name": "采购退货率",
    "module": "数据中心",
    "group": "仓库数据分析",
    "path": "数据中心/仓库数据分析/采购退货率",
    "arch": "report"
  },
  "p241": {
    "id": "p241",
    "name": "销售退货率",
    "module": "数据中心",
    "group": "仓库数据分析",
    "path": "数据中心/仓库数据分析/销售退货率",
    "arch": "report"
  },
  "p242": {
    "id": "p242",
    "name": "IQC检验批合格率",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/IQC检验批合格率",
    "arch": "report"
  },
  "p243": {
    "id": "p243",
    "name": "IQC样本不良率",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/IQC样本不良率",
    "arch": "report"
  },
  "p244": {
    "id": "p244",
    "name": "IQC样本不良",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/IQC样本不良",
    "arch": "list"
  },
  "p245": {
    "id": "p245",
    "name": "首件检验样本不良率",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/首件检验样本不良率",
    "arch": "report"
  },
  "p246": {
    "id": "p246",
    "name": "首件检验样本不良",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/首件检验样本不良",
    "arch": "list"
  },
  "p247": {
    "id": "p247",
    "name": "IPQC巡检检验批合格率",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/IPQC巡检检验批合格率",
    "arch": "report"
  },
  "p248": {
    "id": "p248",
    "name": "IPQC不合格巡检项目",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/IPQC不合格巡检项目",
    "arch": "list"
  },
  "p249": {
    "id": "p249",
    "name": "IPQC巡检样本不良率",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/IPQC巡检样本不良率",
    "arch": "report"
  },
  "p250": {
    "id": "p250",
    "name": "制程原材料使用异常",
    "module": "数据中心",
    "group": "质量数据分析",
    "path": "数据中心/质量数据分析/制程原材料使用异常",
    "arch": "list"
  },
  "p251": {
    "id": "p251",
    "name": "物料损耗率",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/物料损耗率",
    "arch": "report"
  },
  "p252": {
    "id": "p252",
    "name": "线体直通率",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/线体直通率",
    "arch": "report"
  },
  "p253": {
    "id": "p253",
    "name": "产量趋势汇总",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/产量趋势汇总",
    "arch": "report"
  },
  "p254": {
    "id": "p254",
    "name": "产品在制信息",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/产品在制信息",
    "arch": "list"
  },
  "p255": {
    "id": "p255",
    "name": "产品过站记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/产品过站记录",
    "arch": "form"
  },
  "p256": {
    "id": "p256",
    "name": "半成品投入记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/半成品投入记录",
    "arch": "list"
  },
  "p257": {
    "id": "p257",
    "name": "原材料投入记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/原材料投入记录",
    "arch": "list"
  },
  "p258": {
    "id": "p258",
    "name": "在线物料记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/在线物料记录",
    "arch": "list"
  },
  "p259": {
    "id": "p259",
    "name": "生产日报-损耗",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/生产日报-损耗",
    "arch": "list"
  },
  "p260": {
    "id": "p260",
    "name": "每日线体产量",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/每日线体产量",
    "arch": "list"
  },
  "p261": {
    "id": "p261",
    "name": "原材料投入日志",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/原材料投入日志",
    "arch": "list"
  },
  "p262": {
    "id": "p262",
    "name": "原材料投入日志新",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/原材料投入日志新",
    "arch": "report"
  },
  "p263": {
    "id": "p263",
    "name": "物料回收日志新",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/物料回收日志新",
    "arch": "report"
  },
  "p264": {
    "id": "p264",
    "name": "物料回收日志",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/物料回收日志",
    "arch": "list"
  },
  "p265": {
    "id": "p265",
    "name": "合格证报工记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/合格证报工记录",
    "arch": "form"
  },
  "p266": {
    "id": "p266",
    "name": "制令单投料追溯",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/制令单投料追溯",
    "arch": "trace"
  },
  "p267": {
    "id": "p267",
    "name": "报废原因分布",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/报废原因分布",
    "arch": "report"
  },
  "p268": {
    "id": "p268",
    "name": "罐身平衡报表",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/罐身平衡报表",
    "arch": "report"
  },
  "p269": {
    "id": "p269",
    "name": "不良报废明细",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/不良报废明细",
    "arch": "form"
  },
  "p270": {
    "id": "p270",
    "name": "不良报废汇总",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/不良报废汇总",
    "arch": "report"
  },
  "p271": {
    "id": "p271",
    "name": "并垛日志",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/并垛日志",
    "arch": "list"
  },
  "p272": {
    "id": "p272",
    "name": "待处理品转正常日志",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/待处理品转正常日志",
    "arch": "list"
  },
  "p273": {
    "id": "p273",
    "name": "损耗量",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/损耗量",
    "arch": "list"
  },
  "p274": {
    "id": "p274",
    "name": "原材料万罐用量管理",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/原材料万罐用量管理",
    "arch": "list"
  },
  "p275": {
    "id": "p275",
    "name": "设备故障时间分析",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/设备故障时间分析",
    "arch": "report"
  },
  "p276": {
    "id": "p276",
    "name": "设备采集时间分布",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/设备采集时间分布",
    "arch": "report"
  },
  "p277": {
    "id": "p277",
    "name": "日计划达成率",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/日计划达成率",
    "arch": "report"
  },
  "p278": {
    "id": "p278",
    "name": "生产工装上下线",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/生产工装上下线",
    "arch": "list"
  },
  "p279": {
    "id": "p279",
    "name": "安灯发起记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/安灯发起记录",
    "arch": "list"
  },
  "p280": {
    "id": "p280",
    "name": "待处理品报工记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/待处理品报工记录",
    "arch": "form"
  },
  "p281": {
    "id": "p281",
    "name": "报废汇总",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/报废汇总",
    "arch": "report"
  },
  "p282": {
    "id": "p282",
    "name": "生产效率报表",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/生产效率报表",
    "arch": "report"
  },
  "p283": {
    "id": "p283",
    "name": "产线整体报表(ABDE)",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/产线整体报表(ABDE)",
    "arch": "report"
  },
  "p284": {
    "id": "p284",
    "name": "线体实际生产工时",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/线体实际生产工时",
    "arch": "list"
  },
  "p285": {
    "id": "p285",
    "name": "生产效率综合报表",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/生产效率综合报表",
    "arch": "report"
  },
  "p286": {
    "id": "p286",
    "name": "报废条码删除记录",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/报废条码删除记录",
    "arch": "form"
  },
  "p287": {
    "id": "p287",
    "name": "生产综合明细报表",
    "module": "数据中心",
    "group": "生产数据分析",
    "path": "数据中心/生产数据分析/生产综合明细报表",
    "arch": "report"
  },
  "p288": {
    "id": "p288",
    "name": "IQC看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/IQC看板",
    "arch": "dashboard"
  },
  "p289": {
    "id": "p289",
    "name": "出货看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/出货看板",
    "arch": "dashboard"
  },
  "p290": {
    "id": "p290",
    "name": "车间看板（新）",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/车间看板（新）",
    "arch": "dashboard"
  },
  "p291": {
    "id": "p291",
    "name": "盘点看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/盘点看板",
    "arch": "dashboard"
  },
  "p292": {
    "id": "p292",
    "name": "线体看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/线体看板",
    "arch": "dashboard"
  },
  "p293": {
    "id": "p293",
    "name": "车间叫料看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/车间叫料看板",
    "arch": "dashboard"
  },
  "p294": {
    "id": "p294",
    "name": "看板位置维护",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/看板位置维护",
    "arch": "dashboard"
  },
  "p295": {
    "id": "p295",
    "name": "仓库发货看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/仓库发货看板",
    "arch": "dashboard"
  },
  "p296": {
    "id": "p296",
    "name": "库位看板(原料仓)",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/库位看板(原料仓)",
    "arch": "dashboard"
  },
  "p297": {
    "id": "p297",
    "name": "IQC看板",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/IQC看板",
    "arch": "dashboard"
  },
  "p298": {
    "id": "p298",
    "name": "仓库看板新",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/仓库看板新",
    "arch": "dashboard"
  },
  "p299": {
    "id": "p299",
    "name": "制罐线体看板A",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/制罐线体看板A",
    "arch": "dashboard"
  },
  "p300": {
    "id": "p300",
    "name": "制罐线体看板B",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/制罐线体看板B",
    "arch": "dashboard"
  },
  "p301": {
    "id": "p301",
    "name": "制罐线体看板D",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/制罐线体看板D",
    "arch": "dashboard"
  },
  "p302": {
    "id": "p302",
    "name": "制罐线体看板E",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/制罐线体看板E",
    "arch": "dashboard"
  },
  "p303": {
    "id": "p303",
    "name": "生产综合管理看板新",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/生产综合管理看板新",
    "arch": "dashboard"
  },
  "p304": {
    "id": "p304",
    "name": "品质综合看板新",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/品质综合看板新",
    "arch": "dashboard"
  },
  "p305": {
    "id": "p305",
    "name": "测试分析报表",
    "module": "数据中心",
    "group": "数字大屏看板",
    "path": "数据中心/数字大屏看板/测试分析报表",
    "arch": "report"
  },
  "p306": {
    "id": "p306",
    "name": "产品追溯",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/信息追溯/产品追溯",
    "arch": "trace"
  },
  "p307": {
    "id": "p307",
    "name": "物料追溯",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/信息追溯/物料追溯",
    "arch": "trace"
  },
  "p308": {
    "id": "p308",
    "name": "单据产品追溯",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/信息追溯/单据产品追溯",
    "arch": "trace"
  },
  "p309": {
    "id": "p309",
    "name": "物料作业履历",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/信息追溯/物料作业履历",
    "arch": "list"
  },
  "p310": {
    "id": "p310",
    "name": "作业错误日志",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/信息追溯/作业错误日志",
    "arch": "list"
  },
  "p311": {
    "id": "p311",
    "name": "接口日志查询",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/接口日志查询",
    "arch": "list"
  },
  "p312": {
    "id": "p312",
    "name": "SAP接口日志",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/SAP接口日志",
    "arch": "list"
  },
  "p313": {
    "id": "p313",
    "name": "定时任务日志",
    "module": "数据中心",
    "group": "信息追溯",
    "path": "数据中心/定时任务日志",
    "arch": "list"
  },
  "p317": {
    "id": "p317",
    "name": "设备采集数据",
    "module": "数据中心",
    "group": "IOT采集数据",
    "path": "数据中心/IOT采集数据/设备采集数据",
    "arch": "iot"
  },
  "p318": {
    "id": "p318",
    "name": "电表数据报表",
    "module": "数据中心",
    "group": "IOT采集数据",
    "path": "数据中心/IOT采集数据/电表数据报表",
    "arch": "report"
  },
  "p319": {
    "id": "p319",
    "name": "光检机不良信息",
    "module": "数据中心",
    "group": "IOT采集数据",
    "path": "数据中心/IOT采集数据/光检机不良信息",
    "arch": "list"
  },
  "p320": {
    "id": "p320",
    "name": "设备实时状态",
    "module": "数据中心",
    "group": "IOT采集数据",
    "path": "数据中心/IOT采集数据/设备实时状态",
    "arch": "iot"
  },
  "p321": {
    "id": "p321",
    "name": "能耗明细表",
    "module": "数据中心",
    "group": "IOT采集数据",
    "path": "数据中心/能耗明细表",
    "arch": "list"
  },
  "eq-team": { "id": "eq-team", "name": "班组管理", "module": "设备管理", "group": "配置中心", "path": "设备管理/配置中心/班组管理", "arch": "config" },
  "eq-bom": { "id": "eq-bom", "name": "设备BOM", "module": "设备管理", "group": "配置中心", "path": "设备管理/配置中心/设备BOM", "arch": "config" },
  "eq-faultList": { "id": "eq-faultList", "name": "故障明细表", "module": "设备管理", "group": "配置中心", "path": "设备管理/配置中心/故障明细表", "arch": "list" },
  "eq-eqTypePart": { "id": "eq-eqTypePart", "name": "设备类型部位", "module": "设备管理", "group": "配置中心", "path": "设备管理/配置中心/设备类型部位", "arch": "config" },
  "eq-ledger": { "id": "eq-ledger", "name": "设备台账", "module": "设备管理", "group": "资产管理", "path": "设备管理/资产管理/设备台账", "arch": "list" },
  "eq-maintainPlan": { "id": "eq-maintainPlan", "name": "保养计划", "module": "设备管理", "group": "维保管理", "path": "设备管理/维保管理/保养计划", "arch": "list" },
  "eq-checkPlan": { "id": "eq-checkPlan", "name": "检验计划", "module": "设备管理", "group": "维保管理", "path": "设备管理/维保管理/检验计划", "arch": "list" },
  "eq-maintain": { "id": "eq-maintain", "name": "设备保养", "module": "设备管理", "group": "维保管理", "path": "设备管理/维保管理/设备保养", "arch": "form" },
  "eq-inspect": { "id": "eq-inspect", "name": "设备点检/巡检", "module": "设备管理", "group": "维保管理", "path": "设备管理/维保管理/设备点检/巡检", "arch": "form" },
  "eq-repair": { "id": "eq-repair", "name": "设备维修", "module": "设备管理", "group": "维保管理", "path": "设备管理/维保管理/设备维修", "arch": "form" },
  "eq-kbList": { "id": "eq-kbList", "name": "维修知识库", "module": "设备管理", "group": "维保管理", "path": "设备管理/维保管理/维修知识库", "arch": "list" },
  "eq-sparePurchase": { "id": "eq-sparePurchase", "name": "备件采购", "module": "设备管理", "group": "备件管理", "path": "设备管理/备件管理/备件采购", "arch": "form" },
  "eq-spareIn": { "id": "eq-spareIn", "name": "备件入库", "module": "设备管理", "group": "备件管理", "path": "设备管理/备件管理/备件入库", "arch": "form" },
  "eq-spareStock": { "id": "eq-spareStock", "name": "备件库存", "module": "设备管理", "group": "备件管理", "path": "设备管理/备件管理/备件库存", "arch": "list" },
  "eq-spareCheck": { "id": "eq-spareCheck", "name": "备件盘点", "module": "设备管理", "group": "备件管理", "path": "设备管理/备件管理/备件盘点", "arch": "form" },
  "eq-spareUse": { "id": "eq-spareUse", "name": "备件领用", "module": "设备管理", "group": "备件管理", "path": "设备管理/备件管理/备件领用", "arch": "form" },
  "eq-keyComp": { "id": "eq-keyComp", "name": "关键组件", "module": "设备管理", "group": "备件管理", "path": "设备管理/备件管理/关键组件", "arch": "list" },
  "eq-toolArchive": { "id": "eq-toolArchive", "name": "工装建档", "module": "设备管理", "group": "工装管理", "path": "设备管理/工装管理/工装建档", "arch": "config" },
  "eq-toolLedger": { "id": "eq-toolLedger", "name": "工装台账", "module": "设备管理", "group": "工装管理", "path": "设备管理/工装管理/工装台账", "arch": "list" },
  "eq-toolScrap": { "id": "eq-toolScrap", "name": "工装报废", "module": "设备管理", "group": "工装管理", "path": "设备管理/工装管理/工装报废", "arch": "form" },
  "eq-toolHistory": { "id": "eq-toolHistory", "name": "工装履历", "module": "设备管理", "group": "工装管理", "path": "设备管理/工装管理/工装履历", "arch": "list" },
  "eq-home": { "id": "eq-home", "name": "设备管理首页", "module": "设备管理", "group": "数据分析", "path": "设备管理/数据分析/设备管理首页", "arch": "dashboard" },
  "eq-board": { "id": "eq-board", "name": "设备管理看板", "module": "设备管理", "group": "数据分析", "path": "设备管理/数据分析/设备管理看板", "arch": "dashboard" },
  "eq-mttr": { "id": "eq-mttr", "name": "MTTR", "module": "设备管理", "group": "数据分析", "path": "设备管理/数据分析/MTTR", "arch": "report" },
  "eq-mtbf": { "id": "eq-mtbf", "name": "MTBF", "module": "设备管理", "group": "数据分析", "path": "设备管理/数据分析/MTBF", "arch": "report" },
  "eq-energy": { "id": "eq-energy", "name": "能耗明细表", "module": "设备管理", "group": "数据分析", "path": "设备管理/数据分析/能耗明细表", "arch": "list" },
  "prod-batchReport": { "id": "prod-batchReport", "name": "批次报工", "module": "生产管理", "group": "作业工作台", "path": "生产管理/作业工作台/批次报工", "arch": "form" },
  "prod-firstPass": { "id": "prod-firstPass", "name": "首工序过站", "module": "生产管理", "group": "作业工作台", "path": "生产管理/作业工作台/首工序过站", "arch": "form" },
  "prod-midPass": { "id": "prod-midPass", "name": "中末工序过站", "module": "生产管理", "group": "作业工作台", "path": "生产管理/作业工作台/中末工序过站", "arch": "form" },
  "prod-weighPass": { "id": "prod-weighPass", "name": "称重过站", "module": "生产管理", "group": "作业工作台", "path": "生产管理/作业工作台/称重过站", "arch": "form" },
  "prod-ecn": { "id": "prod-ecn", "name": "ECN信息", "module": "生产管理", "group": "过程管控", "path": "生产管理/过程管控/ECN信息", "arch": "list" },
  "prod-invalidTime": { "id": "prod-invalidTime", "name": "无效时间", "module": "生产管理", "group": "过程管控", "path": "生产管理/过程管控/无效时间", "arch": "report" },
  "prod-invalidTimeMgr": { "id": "prod-invalidTimeMgr", "name": "无效时间管理", "module": "生产管理", "group": "过程管控", "path": "生产管理/过程管控/无效时间管理", "arch": "list" },
  "prod-rework": { "id": "prod-rework", "name": "返修管理", "module": "生产管理", "group": "默认", "path": "生产管理/返修管理", "arch": "form" },
  "prod-weighInput": { "id": "prod-weighInput", "name": "物料称重投入", "module": "生产管理", "group": "人员管理", "path": "生产管理/人员管理/物料称重投入", "arch": "form" },
  "prod-downtime": { "id": "prod-downtime", "name": "设备异常停机工时汇总", "module": "数据中心", "group": "默认", "path": "数据中心/设备异常停机工时汇总", "arch": "report" }
};
