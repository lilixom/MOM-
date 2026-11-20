export type EqPageKind = 'home' | 'board' | 'chart' | 'table';

export interface EqFilterDef {
  label: string;
  key: string;
  type?: 'select' | 'radio' | 'date' | 'op';
  op?: boolean;
  opts?: string[];
}

export interface EqColDef {
  t: string;
  k: string;
  cb?: boolean;
  sort?: boolean;
  tag?: boolean;
}

export interface EqFormField {
  label: string;
  key: string;
  type: 'text' | 'select' | 'date' | 'number' | 'textarea' | 'upload';
  opts?: string[];
  required?: boolean;
  full?: boolean;
  hint?: string;
}

export interface EqFormGroup {
  name: string;
  fields: EqFormField[];
}

export interface EqFormSubtable {
  title: string;
  cols: Array<{ label: string; key: string }>;
  rows?: EqRow[];
}

export interface EqFormDef {
  title: string;
  titlePrefix?: string;
  groups: EqFormGroup[];
  subtable?: EqFormSubtable;
  subtabs?: string[];
  subCols?: Array<{ label: string; key: string }>;
  subRows?: EqRow[];
}

export type EqRow = Record<string, string | number | undefined>;

export interface EqPageConfig {
  id: string;
  type: EqPageKind;
  title: string;
  pageSize?: number;
  total?: number;
  search?: EqFilterDef[];
  statRow?: Array<{ label: string; value: number }>;
  cols?: EqColDef[];
  actions?: string[];
  buttons?: string[];
  subtabs?: string[];
  subCols?: EqColDef[];
}

export const EQ_ORG = '昇兴集团-中山制罐工厂';

export const EQ_NUMS = [
  '1020000149-3',
  '1020000149-2',
  '1020000149-1',
  'PGB-01',
  'GCB-01',
  '1020000019',
  '1010000006',
  '1020000048-2',
  '1020000048-3',
  '1020000048',
  '1020000101',
  '1020000119',
  '1020000067',
  '1020000024',
  '1020000031',
  '1020000071',
  '1020000070',
];

export const EQ_NAMES = [
  'DE线自动贴标机',
  'B线自动贴标机',
  'A线自动贴标机',
  '品管部',
  '工程部',
  '1号吸干机',
  '一期电房',
  '2号空压机',
  '3号空压机',
  '1号空压机',
  'D线高频电阻焊机',
  'A线高频电阻焊机',
  'A线翻边缩颈组合机',
  'A线全自动送盖机一拖一',
  'A线全喷烘干炉',
  'A线内全喷涂机',
  'E线高频电阻焊机',
];

const EQ_PROFILE_ROWS: Array<[string, string, string, string, string, string, string]> = [
  ['1020000149-3', '在用', 'A', 'DE线自动贴标机', 'P560-R3ZU-400R', '贴标机', '昇兴机械'],
  ['1020000149-2', '在用', 'A', 'B线自动贴标机', 'P560-R3ZU-400R', '贴标机', '昇兴机械'],
  ['1020000149-1', '在用', 'A', 'A线自动贴标机', 'P560-R3ZU-400R', '贴标机', '昇兴机械'],
  ['PGB-01', '在用', 'A', '品管部', '品管部', '安灯设备', '昇兴'],
  ['GCB-01', '在用', 'A', '工程部', '工程部', '安灯设备', '昇兴'],
  ['1020000019', '在用', 'A', '1号吸干机', '干燥机285', '干燥机', '不详'],
  ['1010000006', '在用', 'A', '一期电房', '2000KVA', '电房', '中山顺行机电'],
  ['1020000048-2', '在用', 'A', '2号空压机', 'ZT75-8 Classic', '空压机', '阿特拉斯'],
  ['1020000048-3', '在用', 'A', '3号空压机', 'ZT90VSD-8.6 Classic', '空压机', '阿特拉斯'],
  ['1020000048', '在用', 'A', '1号空压机', 'ZT75VSD-8.6 Classic', '空压机', '阿特拉斯'],
  ['1020000101', '在用', 'A', 'D线高频电阻焊机', '其他', '电阻焊机', '昇兴机械'],
  ['1020000119', '在用', '其他', 'E线高频电阻焊机', '1080FB', '电阻焊机', '昇兴机械'],
  ['1020000067', '在用', 'A', 'A线高频电阻焊机', '1080FB', '电阻焊机', '昇兴机械'],
  ['1020000024', '在用', 'A', 'A线翻边缩颈组合机', 'HY-S82HN', '缩颈翻边组合机', '昇兴机械'],
  ['1020000031', '在用', 'A', 'A线全自动送盖机一拖一', '其他', '自动加盖机', '昇兴机械'],
  ['1020000071', '在用', 'A', 'A线全喷烘干炉', 'KG-800', '烘房', '昇兴机械'],
  ['1020000070', '在用', 'A', 'A线内全喷涂机', '4B-12126', '内全喷机', '昇兴机械'],
];

const pad = (n: number, len = 2) => String(n).padStart(len, '0');
const pickAt = <T,>(arr: T[], idx: number): T => arr[idx % arr.length];
const mkRows = <T,>(n: number, fn: (i: number) => T): T[] =>
  Array.from({ length: n }, (_, i) => fn(i));

const FD = (
  label: string,
  key: string,
  type: EqFormField['type'] = 'text',
  opts?: string[] | null,
  extra?: Partial<EqFormField>
): EqFormField => ({
  label,
  key,
  type,
  opts: opts || [],
  ...extra,
});

const COL = (t: string, k: string, o: Partial<EqColDef> = {}): EqColDef => ({
  t,
  k,
  ...o,
});

const OP = (label: string, key: string, opts?: string[]): EqFilterDef => ({
  label,
  key,
  type: 'op',
  op: true,
  opts,
});

const SEL = (label: string, key: string, opts: string[]): EqFilterDef => ({
  label,
  key,
  type: 'select',
  opts,
});

const ALL = (label: string, key: string, opts: string[]): EqFilterDef => ({
  label,
  key,
  type: 'radio',
  opts,
});

const DATE = (label: string, key = ''): EqFilterDef => ({
  label,
  key,
  type: 'date',
});

export const EQ_FORMS: Record<string, EqFormDef> = {
  team: {
    title: '班组',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('班组编码', 'code', 'text', null, { required: true }),
          FD('班组名称', 'name', 'text', null, { required: true }),
          FD('所属部门', 'dept', 'select', ['生产部', '设备部', '品管部', '工程部', '仓储部'], {
            required: true,
          }),
          FD('班组长', 'leader', 'select', ['黄田兴', '刘起飞', '朱和全', '邓先元', '孙运妹']),
          FD('班组人数', 'count', 'number'),
          FD('班次', 'shift', 'select', ['白班(08:30-20:30)', '夜班(20:30-08:30)', '长白班']),
          FD('联系电话', 'phone', 'text'),
          FD('状态', 'status', 'select', ['正常', '启用', '停用']),
        ],
      },
    ],
  },
  bom: {
    title: '设备BOM',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [EQ_ORG], { required: true }),
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备名称', 'name', 'text', null, { required: true }),
          FD('设备型号', 'model', 'select', ['4B-12126', 'HY-SPM-800', 'KG-800', '1080FB', 'P560-R3ZU-400R', '其他']),
          FD('设备类型', 'type', 'select', ['电阻焊机', '提升机', '自动加盖机', '检漏机', '缩颈翻边组合机', '贴标机', '空压机', '烘房', '内全喷机']),
          FD('设备类别', 'cat', 'select', ['A', 'B', 'C', '其他']),
          FD('安装地点', 'loc', 'text'),
        ],
      },
    ],
    subtabs: ['备件', '工装'],
    subCols: [
      { label: '料号', key: 'code' },
      { label: '名称', key: 'name' },
      { label: '规格', key: 'spec' },
      { label: '数量', key: 'qty' },
    ],
    subRows: [],
  },
  faultList: {
    title: '故障明细',
    titlePrefix: '添加',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('故障编码', 'code', 'text', null, { required: true }),
          FD('设备类型', 'name', 'select', ['自动加盖机', '内全喷机', '封口机', '收罐机', '电阻焊机', '提升机', '检漏机']),
          FD('故障代码', 'fcode', 'text', null, { required: true }),
          FD('故障现象', 'phenom', 'textarea'),
          FD('故障原因', 'cause', 'textarea'),
          FD('故障原因代码', 'ccode', 'text'),
          FD('维修方式', 'fix', 'text'),
          FD('故障部位', 'part', 'select', ['输送一', '整体', '缩颈', '上料系统']),
        ],
      },
    ],
  },
  eqTypePart: {
    title: '设备类型部位',
    titlePrefix: '新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('设备类型', 'type', 'select', [
            '贴标机',
            '空压机',
            '电阻焊机',
            '提升机',
            '自动加盖机',
            '检漏机',
            '缩颈翻边组合机',
            '烘干炉',
            '全喷机',
            '封口机',
            '收罐机',
          ], { required: true }),
        ],
      },
    ],
    subtable: {
      title: '设备部位',
      cols: [
        { label: '部位编码', key: 'code' },
        { label: '部位名称', key: 'name' },
        { label: '备注', key: 'remark' },
      ],
      rows: [],
    },
  },
  ledger: {
    title: '设备台账',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备状态', 'status', 'select', ['在用', '待启用', '维修中', '封存', '报废'], {
            required: true,
          }),
          FD('设备名称', 'name', 'text', null, { required: true }),
          FD('设备类型', 'type', 'select', [
            '贴标机',
            '安灯设备',
            '干燥机',
            '电房',
            '空压机',
            '电阻焊机',
            '缩颈翻边组合机',
            '自动加盖机',
            '烘房',
            '内全喷机',
            '提升机',
            '检漏机',
          ], { required: true }),
          FD('设备型号', 'model', 'select', [
            'P560-R3ZU-400R',
            '4B-12126',
            'HY-SPM-800',
            'KG-800',
            '1080FB',
            'HY-S82HN',
            'ZT75-8 Classic',
            'ZT90VSD-8.6 Classic',
            '其他',
          ], { required: true }),
          FD('设备类别', 'cat', 'select', ['A', 'B', 'C', '其他'], { required: true }),
          FD('出厂编号', 'sn', 'text'),
          FD('出厂年月', 'date', 'date'),
          FD('总功率', 'power', 'number'),
          FD('设备原值', 'value', 'number'),
          FD('投产时间', 'prod', 'date'),
          FD('存放位置', 'loc', 'select', ['DE线', 'B线', 'A线', 'D线', 'E线', '一期电房', '品管部', '工程部', '制罐车间', '印刷车间']),
          FD('所属部门', 'dept', 'select', ['0405_生产部', '设备部', '品管部', '工程部', '仓储部'], {
            required: true,
          }),
          FD('制造厂商', 'maker', 'text', null, { required: true }),
          FD('供应商', 'supplier', 'text'),
          FD('有效标识', 'valid', 'select', ['有效', '无效']),
          FD('资产编号', 'asset', 'text', null, { required: true }),
          FD('购买日期', 'buy', 'date', null, { required: true }),
        ],
      },
      {
        name: '料站信息',
        fields: [
          FD('设备图片', 'pic', 'upload', null, {
            hint: '图片大小限制：10MB　最大图片数：9　图片支持格式：.jpg,.png,.jpeg,.bmp,.gif,.tif',
            full: true,
          }),
          FD('备注', 'remark', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  maintainPlan: {
    title: '保养计划',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('计划名称', 'name', 'text', null, { required: true }),
          FD('设备名称', 'eq', 'select', EQ_NAMES, { required: true }),
          FD('设备编码', 'code', 'text'),
          FD('设备类型', 'type', 'select', ['检漏机', '焊接机', '电磁烘干炉', '自动加盖机', '打包机', '缩颈翻边组合机', '内全喷机']),
          FD('保养周期', 'cycle', 'select', ['周', '月', '两月', '季度', '半年', '全年']),
          FD('计划日期', 'planDate', 'date'),
          FD('保养人员', 'staff', 'select', ['黄田兴, 刘起飞', '刘起飞, 刘水洪', '邓先元, 李春松', '朱和全, 包小浩']),
          FD('使用部门', 'dept', 'select', ['0405_生产部', '设备部', '品管部', '工程部', '仓储部']),
          FD('计划状态', 'status', 'select', ['执行中', '已停用', '已关结']),
          FD('保养内容', 'content', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  checkPlan: {
    title: '检验计划',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备名称', 'name', 'select', EQ_NAMES, { required: true }),
          FD('设备类别', 'cat', 'select', ['A', 'B', 'C']),
          FD('设备类型', 'type', 'select', ['烘房', '内全喷机', '电阻焊机', '提升机']),
          FD('设备型号', 'model', 'text'),
          FD('状态', 'status', 'select', ['执行中', '已停用', '已关结']),
          FD('检验项目', 'plan', 'textarea', null, { full: true }),
          FD('项目类型', 'ptype', 'select', ['清洁', '点检', '润滑', '紧固']),
          FD('检验周期', 'ctype', 'select', ['周', '两月', '月', '季度']),
        ],
      },
    ],
  },
  maintain: {
    title: '设备保养',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('保养工单号', 'no', 'text', null, { required: true }),
          FD('单据状态', 'status', 'select', ['待接单', '执行中', '已验证', '已关结']),
          FD('是否生产', 'produce', 'select', ['是', '否']),
          FD('保养类型', 'cycle', 'select', ['周保养', '月度保养', '年度保养', '临时保养']),
          FD('保养计划', 'plan', 'text'),
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备名称', 'name', 'select', EQ_NAMES, { required: true }),
          FD('设备型号', 'model', 'text'),
        ],
      },
    ],
    subtabs: ['执行记录', '保养项目', '更换备件'],
    subCols: [
      { label: '项目', key: 'name' },
      { label: '标准', key: 'std' },
      { label: '结果', key: 'result' },
    ],
    subRows: [],
  },
  inspect: {
    title: '设备点检/巡检',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('点检单号', 'no', 'text', null, { required: true }),
          FD('单据状态', 'status', 'select', ['待接单', '已完成', '已关结']),
          FD('是否生产', 'produce', 'select', ['是', '否']),
          FD('点检类型', 'type', 'select', ['点检', '清洁', '润滑']),
          FD('点检计划', 'plan', 'text'),
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备名称', 'name', 'select', EQ_NAMES, { required: true }),
          FD('创建时间', 'ctime', 'date'),
        ],
      },
    ],
    subtabs: ['执行记录', '检验项目'],
    subCols: [
      { label: '项目', key: 'name' },
      { label: '标准', key: 'std' },
      { label: '结果', key: 'result' },
    ],
    subRows: [],
  },
  repair: {
    title: '故障报修',
    titlePrefix: '故障报修',
    groups: [
      {
        name: '报修信息',
        fields: [
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备名称', 'name', 'select', EQ_NAMES),
          FD('故障类型', 'fault', 'select', ['功能性不良', '故障停机', '高低位置不对', '其他']),
          FD('故障点位', 'part', 'select', ['整体', '输送一', '缩颈', '上料系统']),
          FD('故障编码', 'fcode', 'text'),
          FD('故障时间', 'ftime', 'date', null, { required: true }),
          FD('报修人', 'reporter', 'text'),
          FD('报修时间', 'rtime', 'date'),
          FD('申请部门', 'dept', 'select', ['0405_生产部', '设备部', '品管部', '工程部', '仓储部'], {
            required: true,
          }),
          FD('紧急程度', 'level', 'select', ['一般', '重要', '紧急'], { required: true }),
          FD('故障现象', 'phenom', 'textarea', null, { required: true, full: true }),
          FD('报修图片', 'pic', 'upload', null, {
            hint: '图片大小限制：50MB　最大图片数：9　图片支持格式：.jpg,.png,.jpeg,.bmp,.gif',
            full: true,
          }),
        ],
      },
    ],
  },
  kbList: {
    title: '维修知识库',
    titlePrefix: '+新增',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('设备编码', 'code', 'text', null, { required: true }),
          FD('设备名称', 'name', 'select', EQ_NAMES, { required: true }),
          FD('设备类型', 'type', 'select', ['电阻焊机', '提升机', '自动加盖机', '检漏机', '缩颈翻边组合机']),
          FD('故障代码', 'fcode', 'select', ['高低位置不对', '故障停机', '其他', '开机准备']),
          FD('故障部位', 'part', 'select', ['输送一', '整体', '缩颈', '上料系统']),
          FD('故障现象', 'phenom', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  sparePurchase: {
    title: '备件采购',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('采购单号', 'no', 'text', null, { required: true }),
          FD('采购订单类型', 'ptype', 'select', ['非生产性物料采购', '费用采购'], {
            required: true,
          }),
          FD('申请部门', 'dept', 'text'),
          FD('紧急标志', 'urgent', 'select', ['紧急', '一般']),
          FD('附件', 'attach', 'upload', null, { full: true }),
          FD('备注', 'remark', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  spareIn: {
    title: '备件入库',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('入库类型', 'type', 'select', ['个体', '批量'], { required: true }),
          FD('入库人员', 'user', 'select', ['孙运妹', '莫立连', '黄文敬'], { required: true }),
          FD('采购单号', 'no', 'text'),
          FD('备件编码', 'code', 'text', null, { required: true }),
          FD('备件料号', 'mat', 'text'),
          FD('备件名称', 'name', 'text', null, { required: true }),
          FD('备件规格', 'spec', 'text'),
          FD('批次号', 'batch', 'text'),
          FD('入库时间', 'ctime', 'date'),
        ],
      },
    ],
  },
  spareStock: {
    title: '备件库存',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('组织机构', 'org', 'select', [EQ_ORG]),
          FD('备件编码', 'code', 'text', null, { required: true }),
          FD('备件料号', 'mat', 'text', null, { required: true }),
          FD('备件名称', 'name', 'text', null, { required: true }),
          FD('备件规格', 'spec', 'text'),
          FD('库存类别', 'cat', 'select', ['备件', '易耗品', '原材料']),
          FD('仓库', 'wh', 'select', ['主仓库', '备件库', '危化品库']),
          FD('库位', 'loc', 'text'),
          FD('物料数量', 'qty', 'number'),
          FD('费用类别', 'fee', 'select', ['备件费用', '维修费用', '其他']),
        ],
      },
    ],
  },
  spareCheck: {
    title: '备件盘点',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('盘点单号', 'no', 'text', null, { required: true }),
          FD('盘点人', 'user', 'select', ['孙运妹', '莫立连', '黄文敬']),
          FD('计划盘点时间', 'stime', 'date'),
          FD('状态', 'status', 'select', ['待接单', '待盘点', '盘点中', '已完成', '关结']),
          FD('备注', 'remark', 'textarea', null, { full: true }),
        ],
      },
    ],
    subtabs: ['备件清单', '备件明细', '执行记录'],
    subCols: [
      { label: '备件料号', key: 'code' },
      { label: '备件名称', key: 'name' },
      { label: '数量', key: 'qty' },
    ],
    subRows: [],
  },
  spareUse: {
    title: '备件领用',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('领用单号', 'no', 'text', null, { required: true }),
          FD('领用类型', 'type', 'select', ['保养', '维修', '易耗品']),
          FD('设备编码', 'code', 'text'),
          FD('设备名称', 'name', 'select', EQ_NAMES),
          FD('申请人', 'apply', 'select', ['黄文敬', '谢吉飞', '杨华勇', '孙运妹']),
          FD('审核人', 'audit', 'select', ['孙运妹', '莫立连']),
          FD('备注', 'remark', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  keyComp: {
    title: '关键组件',
    titlePrefix: '添加',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('工装编码', 'code', 'text', null, { required: true }),
          FD('组件名称', 'name', 'text', null, { required: true }),
          FD('操作类型', 'type', 'select', ['上机', '下机', '外修']),
          FD('产线', 'line', 'select', ['制罐A线', '制罐B线', '制罐D线', '制罐E线']),
          FD('上机产量/万罐', 'out', 'number'),
          FD('是否外修', 'repair', 'select', ['否', '是']),
          FD('上机人', 'user', 'text'),
          FD('备注', 'remark', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  toolArchive: {
    title: '工装建档',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('工装料号', 'code', 'text', null, { required: true }),
          FD('工装名称', 'name', 'text', null, { required: true }),
          FD('工装类型', 'type', 'select', ['FBB5700U焊机', '夹具', '模具', '刀具', '检具', '其他'], {
            required: true,
          }),
          FD('工装规格', 'spec', 'text'),
          FD('条码校验规则', 'rule', 'text'),
          FD('条码生成规则', 'gen', 'text'),
          FD('创建人', 'creator', 'text'),
          FD('备注', 'remark', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
  toolLedger: {
    title: '工装台账',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('工装编码', 'code', 'text', null, { required: true }),
          FD('工装名称', 'name', 'text', null, { required: true }),
          FD('工装料号', 'mat', 'text'),
          FD('工装类型', 'type', 'select', ['夹具', '模具', '刀具', '检具', '辅具']),
          FD('工装规格', 'spec', 'text'),
          FD('状态', 'status', 'select', ['在库', '上线', '维修确认', '故障', '禁用', '报废']),
          FD('保养状态', 'maint', 'select', ['正常', '到期', '过期']),
          FD('供应商', 'supplier', 'text'),
        ],
      },
    ],
  },
  toolScrap: {
    title: '工装报废',
    titlePrefix: '新增报废',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('工装编码', 'code', 'text', null, { required: true }),
          FD('工装料号', 'mat', 'text', null, { required: true }),
          FD('工装名称', 'name', 'text'),
          FD('报废类型', 'type', 'select', ['正常报废', '异常报废', '工艺变更'], {
            required: true,
          }),
          FD('报废原因', 'reason', 'select', ['磨损超限', '损坏无法修复', '工艺变更', '其他'], {
            required: true,
          }),
          FD('报废时间', 'time', 'date', null, { required: true }),
          FD('报废人', 'user', 'text'),
          FD('工装规格', 'spec', 'text'),
        ],
      },
    ],
  },
  toolHistory: {
    title: '工装履历',
    groups: [
      {
        name: '基础信息',
        fields: [
          FD('工装编码', 'code', 'text', null, { required: true }),
          FD('工装料号', 'mat', 'text'),
          FD('工装状态', 'status', 'select', ['在库', '上线', '维修确认', '故障', '禁用', '报废']),
          FD('操作类型', 'otype', 'select', ['入库', '禁用', '解禁', '报废']),
          FD('供应商', 'supplier', 'text'),
          FD('内容', 'content', 'textarea', null, { full: true }),
        ],
      },
    ],
  },
};

const LEDGER_INITIAL_DATES = ['', '', '', '', '', '2014-07', '2016-09', '2017-01', '2018-08', '2021-06'];

export function buildInitialEquipmentData(): Record<string, EqRow[]> {
  return {
    ledger: mkRows(119, (i) => {
      const r = EQ_PROFILE_ROWS[i % EQ_PROFILE_ROWS.length];
      const year = 2013 + ((i * 7) % 11);
      const month = 1 + ((i * 5) % 12);
      return {
        org: EQ_ORG,
        code: r[0],
        status: r[1],
        cat: r[2],
        name: r[3],
        model: r[4],
        type: r[5],
        maker: r[6],
        loc: r[3].startsWith('A线') ? 'A线' : r[3].startsWith('B线') ? 'B线' : r[3].startsWith('D') ? 'D线' : r[3].startsWith('E') ? 'E线' : '制罐车间',
        dept: '0405_生产部',
        asset: `ZC-${r[0]}`,
        valid: '有效',
        date: i < 10 ? LEDGER_INITIAL_DATES[i] : `${year}-${pad(month)}`,
      };
    }),
    bom: mkRows(119, (i) => {
      const r = EQ_PROFILE_ROWS[i % EQ_PROFILE_ROWS.length];
      return {
        org: EQ_ORG,
        code: r[0],
        cat: r[2],
        type: r[5],
        model: r[4],
        name: r[3],
        loc: r[3].startsWith('A线') ? '制罐A线' : r[3].startsWith('B线') ? '制罐B线' : '制罐车间',
      };
    }),
    faultList: [
      { org: EQ_ORG, code: 'JGJ', type: '自动加盖机', name: '自动加盖机', fcode: 'JGJ-02-02J-01', phenom: '切纸滚筒不工作', cause: '有盖子卡在切刀处', ccode: '01', fix: '清理卡盖，重新供盖', part: '上料系统' },
      { org: EQ_ORG, code: 'QP', type: '内全喷机', name: '内全喷机', fcode: 'QP-03-05J-01', phenom: '涂料堆积', cause: '吸盘气管磨损老化', ccode: '01', fix: '更换气管', part: '整体' },
      { org: EQ_ORG, code: 'JGJ', type: '自动加盖机', name: '自动加盖机', fcode: 'JGJ-03-04J-01', phenom: '备料槽卡盖', cause: '来料盖子长度有差异', ccode: '01', fix: '清理卡盖，重新供盖，调整备料槽间距', part: '上料系统' },
      { org: EQ_ORG, code: 'FK', type: '封口机', name: '封口机', fcode: 'FK-01-08J-01', phenom: '翻边脏污', cause: '罐内粉末脱落残留在拖罐盘内与罐子翻边摩擦', ccode: '01', fix: '清洁拖罐盘', part: '整体' },
      { org: EQ_ORG, code: 'SG', type: '收罐机', name: '收罐机', fcode: 'SG-19-01D-01', phenom: '设备启动后有异响、冒烟或瞬间停机', cause: '电机或主轴抱死（机械卡滞）', ccode: '01', fix: '手动盘车检查机械阻力，分离负载进行空载测试', part: '整体' },
      { org: EQ_ORG, code: 'QP', type: '内全喷机', name: '内全喷机', fcode: 'QP-03-04J-01', phenom: '喷涂不均匀', cause: '吸盘磨损真空压力不足', ccode: '01', fix: '更换吸盘', part: '整体' },
      { org: EQ_ORG, code: 'SG', type: '收罐机', name: '收罐机', fcode: 'SG-17-01D-01', phenom: '按下启动按钮无响应', cause: '急停开关未复位或触点粘连', ccode: '02', fix: '顺时针旋转复位急停开关，或更换损坏的触点组', part: '整体' },
      { org: EQ_ORG, code: 'SG', type: '收罐机', name: '收罐机', fcode: 'SG-17-01D-01', phenom: '按下启动按钮无响应', cause: '控制回路保险丝或中间继电器损坏', ccode: '03', fix: '更换控制保险丝，检查并更换烧毁的继电器', part: '整体' },
    ],
    eqTypePart: [
      '贴标机', '空压机', '洗板机', '电房', '叉车', '混盖检测仪', '焊缝检测仪', '自动加盖机',
      '光检机', '打包机', '电阻焊机', '检漏机', '烘干炉', '缩颈翻边组合机', '裹包机', '裁剪机',
      '机械手臂', '送盖机', '提升机', '冷却风送机', '金属罐内部缺陷检测设备', '全喷机', '封口机', '收罐机',
    ].map((t) => ({ org: EQ_ORG, type: t })),
    team: mkRows(12, (i) => ({
      org: EQ_ORG,
      code: `BZ${pad(i + 1, 3)}`,
      name: `${pickAt(['甲', '乙', '丙', '丁'], i)}班-${pickAt(['生产', '设备', '品管'], i)}组`,
      dept: pickAt(['生产部', '设备部', '品管部', '工程部'], i),
      leader: pickAt(['黄田兴', '刘起飞', '刘水洪', '吴嘉辉', '黄文敬', '朱和全'], i),
      count: 8 + ((i * 5) % 21),
      shift: pickAt(['白班(08:30-20:30)', '夜班(20:30-08:30)'], i),
      status: '正常',
    })),
    maintainPlan: [
      { org: EQ_ORG, name: '检漏机年度保养', code: '1020000105', eq: 'D线检漏机', type: '检漏机', model: '其他', dept: '0405_生产部', staff: '黄田兴, 刘起飞', status: '执行中', ptype: '周期', cycle: '全年' },
      { org: EQ_ORG, name: '焊接机每周保养', code: '1020000101', eq: 'D线高频电阻焊机', type: '焊接机', model: '其他', dept: '0405_生产部', staff: '刘起飞, 刘水洪, 吴嘉辉, 黄文敬', status: '执行中', ptype: '周期', cycle: '周' },
      { org: EQ_ORG, name: '电磁炉下半年保养', code: '1020000132', eq: 'B线电磁烘干炉', type: '电磁烘干炉', model: '其他', dept: '0405_生产部', staff: '黄文敬, 刘水洪, 刘起飞, 吴嘉辉', status: '执行中', ptype: '周期', cycle: '半年' },
      { org: EQ_ORG, name: '加盖机年度保养', code: '1020000033', eq: 'DE线全自动送盖机一拖二', type: '自动加盖机', model: '其他', dept: '0405_生产部', staff: '黄田兴, 刘起飞, 朱和全', status: '执行中', ptype: '周期', cycle: '全年' },
      { org: EQ_ORG, name: '检漏机上半年保养', code: '1020000105', eq: 'D线检漏机', type: '检漏机', model: '其他', dept: '0405_生产部', staff: '邓先元, 李春松', status: '执行中', ptype: '周期', cycle: '半年' },
      { org: EQ_ORG, name: '打包机-年度保养', code: '1020000009', eq: 'A线悬臂裹包机', type: '打包机', model: '其他', dept: '0405_生产部', staff: '朱和全, 包小浩, 杨守营', status: '执行中', ptype: '周期', cycle: '全年' },
      ...mkRows(30, (i) => ({
        org: EQ_ORG,
        name: pickAt(['检漏机每周保养', '焊接机每周保养', '缩颈每周保养', '打包机每周保养', '全喷机每周保养'], i),
        code: pickAt(EQ_NUMS, i + 3),
        eq: pickAt(EQ_NAMES, i + 3),
        type: pickAt(['检漏机', '焊接机', '缩颈翻边组合机', '打包机', '内全喷机'], i),
        model: '其他',
        dept: '0405_生产部',
        staff: pickAt(['黄田兴, 刘起飞', '刘起飞, 刘水洪', '邓先元, 李春松', '朱和全, 包小浩'], i),
        status: '执行中',
        ptype: pickAt(['周期', '保养间隔', '生产次数', '临时保养'], i),
        cycle: pickAt(['周', '月', '两月', '季度', '半年'], i),
      })),
    ],
    checkPlan: [
      ['1020000125', 'E线全喷烘干炉', 'A', '烘房', 'KG-800', '执行中', '烘房风机焦油、烘炉炉灰清洁', '清洁', '1', '两月'],
      ['1020000071', 'A线全喷烘干炉', 'A', '烘房', 'KG-800', '执行中', '烘房风机焦油、烘炉炉灰清洁', '清洁', '1', '两月'],
      ['1020000137', 'B线全喷烘干炉', 'A', '烘房', 'KG-800', '执行中', '烘房风机焦油、烘炉炉灰清洁', '清洁', '1', '两月'],
      ['1020000107', 'D线全喷烘干炉', 'A', '烘房', 'KG-800', '执行中', '烘房风机焦油、烘炉炉灰清洁', '清洁', '1', '两月'],
      ['1020000071', 'A线全喷烘干炉', 'A', '烘房', 'KG-800', '执行中', '烘房更换过滤棉', '清洁', '1', '周'],
      ['1020000125', 'E线内全喷涂机', 'A', '内全喷机', 'HY-SPM-800', '执行中', '全喷RTO抽废涂料过滤器清洁', '清洁', '1', '两月'],
      ...mkRows(20, (i) => [
        pickAt(['1020000070', '1020000071', '1020000067', '1020000024'], i),
        pickAt(['A线内全喷涂机', 'A线全喷烘干炉', 'A线高频电阻焊机', 'A线翻边缩颈组合机'], i),
        'A',
        pickAt(['内全喷机', '烘房', '电阻焊机', '缩颈翻边组合机'], i),
        pickAt(['4B-12126', 'KG-800', '1080FB', 'HY-S82HN'], i),
        '执行中',
        pickAt(['全喷RTO抽废涂料过滤器清洁', '烘房风机皮带张紧度检查', '焊轮冷却水路点检', '缩颈模具润滑点检'], i),
        pickAt(['清洁', '点检', '润滑', '紧固'], i),
        '1',
        pickAt(['两月', '周', '月', '季度'], i),
      ]),
    ].map((r) => ({
      org: EQ_ORG,
      code: r[0],
      name: r[1],
      cat: r[2],
      type: r[3],
      model: r[4],
      status: r[5],
      plan: r[6],
      ptype: r[7],
      cycle: r[8],
      ctype: r[9],
    })),
    maintain: [
      ['2026111800014', '已关结', '否', '临时保养', '', '1020000119', '', 'E线高频电阻焊机', '1080FB'],
      ['2026111800013', '待接单', '是', '周保养', '检漏机每周保养', '1020000069', 'SA', 'A线检漏机', 'CI_60H'],
      ['2026111800012', '已验证', '是', '周保养', '打包机每周保养', '1020000009', 'SA', 'A线悬臂裹包机', 'MP402'],
      ['2026111800011', '待接单', '是', '周保养', '缩颈每周保养', '1020000024', 'SA', 'A线翻边缩颈组合机', 'HY-S82HN'],
      ['2026111800010', '待接单', '是', '周保养', '全喷机每周保养', '1020000070', 'SA', 'A线内全喷涂机', '4B-12126'],
      ['2026111800009', '待接单', '是', '周保养', '裁剪每周保养', '1020000034', 'SA', 'A线裁剪机', 'YC-650'],
      ['2026111800008', '待接单', '是', '周保养', '烘房每周保养', '1020000071', 'SA', 'A线全喷烘干炉', 'KG-800'],
      ['2026111800007', '待接单', '是', '周保养', '机械手臂每周保养', '1020000040', 'SA', 'A线机械手臂', 'KYL0201406'],
      ['2026111800006', '已验证', '是', '周保养', '打包机每周保养', '1020000073', 'SA', 'A线全自动捆包机', 'A-72AO'],
      ...mkRows(15, (i) => [
        `20261117000${pad(15 - i)}`,
        pickAt(['待接单', '执行中', '已验证', '已关结'], i),
        '是',
        '周保养',
        '点检每周保养',
        pickAt(EQ_NUMS, i),
        'SA',
        pickAt(EQ_NAMES, i),
        '其他',
      ]),
    ].map((r) => ({
      org: EQ_ORG,
      no: r[0],
      status: r[1],
      produce: r[2],
      cycle: r[3],
      plan: r[4],
      code: r[5],
      line: r[6],
      name: r[7],
      model: r[8],
    })),
    inspect: [
      ['2026111700061', '已完成', '是', '清洁', '缩颈机/白班', '2026-11-17 08:34:07', '2026-11-17 10:31:06', '1020000024', 'A线翻边缩颈组合机'],
      ['2026111700060', '已完成', '是', '点检', '焊机/白班', '2026-11-17 08:34:07', '2026-11-19 11:04:19', '1020000067', 'A线高频电阻焊机'],
      ['2026111700059', '已完成', '是', '清洁', '罐内缺陷/白班', '2026-11-17 08:34:07', '2026-11-17 10:22:46', '041221101-2', 'A线金属罐内部缺陷检测设备'],
      ['2026111700058', '待接单', '是', '清洁', '前段罐路/夜班', '2026-11-17 08:34:07', '', '1020000003', 'A线冷却风送机'],
      ['2026111700057', '已完成', '是', '点检', '罐内缺陷/白班', '2026-11-17 08:34:07', '2026-11-17 10:22:52', '041221101-2', 'A线金属罐内部缺陷检测设备'],
      ['2026111700056', '已完成', '是', '点检', '机械手臂/白班', '2026-11-17 08:34:07', '2026-11-17 09:24:33', '1020000040', 'A线机械手臂'],
      ['2026111700055', '待接单', '是', '清洁', '前段罐路/夜班', '2026-11-17 08:34:07', '', '1020000001', 'A线上下坡立罐'],
      ...mkRows(15, (i) => [
        `20261117000${pad(54 - i)}`,
        i % 4 === 0 ? '待接单' : '已完成',
        '是',
        pickAt(['点检', '清洁'], i),
        pickAt(['加盖机/白班', '焊机/白班', '缩颈机/白班'], i),
        '2026-11-17 08:34:07',
        i % 4 === 0 ? '' : '2026-11-17 10:31:18',
        pickAt(EQ_NUMS, i),
        pickAt(EQ_NAMES, i),
      ]),
    ].map((r) => ({
      org: EQ_ORG,
      no: r[0],
      status: r[1],
      produce: r[2],
      type: r[3],
      plan: r[4],
      ctime: r[5],
      etime: r[6],
      code: r[7],
      name: r[8],
    })),
    repair: [
      { org: EQ_ORG, no: '2026111700003', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-18 11:47:20', dtype: '维修', code: '1020000067', name: 'A线高频电阻焊机', fault: '功能性不良', part: '整体', level: '一般', reporter: '李元龙', rtime: '2026-11-17 09:12:33', repairman: '黄田兴', dept: '0405_生产部', loc: '制罐A线', result: '已修复', etime: '2026-11-18 11:47:20', phenom: '焊接电流波动导致焊缝虚焊' },
      { org: EQ_ORG, no: '2026111700006', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-18 11:02:20', dtype: '维修', code: '1020000076', name: 'A线组合式提升机', fault: '故障停机', part: '整体', level: '紧急', reporter: '刘起飞', rtime: '2026-11-17 08:40:11', repairman: '邓先元', dept: '0405_生产部', loc: '制罐A线', result: '已修复', etime: '2026-11-18 11:02:20', phenom: '提升带过载触发变频器报警停机' },
      { org: EQ_ORG, no: '2026111700005', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-18 10:17:20', dtype: '维修', code: '1020000139', name: 'A线缩颈反边机', fault: '功能性不良', part: '缩颈', level: '重要', reporter: '朱和全', rtime: '2026-11-17 07:55:02', repairman: '包小浩', dept: '0405_生产部', loc: '制罐A线', result: '已修复', etime: '2026-11-18 10:17:20', phenom: '缩颈口起皱偏差超限' },
      { org: EQ_ORG, no: '2026111700004', status: '维修中', verify: '', audit: '待审核', star: '', dtype: '维修', code: '1020000031', name: 'A线全自动送盖机一拖一', fault: '功能性不良', part: '上料系统', level: '重要', reporter: '刘水洪', rtime: '2026-11-17 07:30:48', repairman: '杨守营', dept: '0405_生产部', loc: '制罐A线', result: '', etime: '', phenom: '分盖螺杆卡盖导致供盖中断' },
      { org: EQ_ORG, no: '2026111700002', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-18 09:02:20', dtype: '维修', code: '1020000067', name: 'A线高频电阻焊机', fault: '高低位置不对', part: '输送一', level: '一般', reporter: '李元龙', rtime: '2026-11-17 06:18:20', repairman: '黄田兴', dept: '0405_生产部', loc: '制罐A线', result: '已修复', etime: '2026-11-18 09:02:20', phenom: '推爪定位高度偏低造成罐体歪斜' },
      { org: EQ_ORG, no: '2026111700001', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-18 08:47:20', dtype: '维修', code: '1020000067', name: 'A线高频电阻焊机', fault: '故障停机', part: '整体', level: '紧急', reporter: '李元龙', rtime: '2026-11-17 05:40:10', repairman: '黄田兴', dept: '0405_生产部', loc: '制罐A线', result: '已修复', etime: '2026-11-18 08:47:20', phenom: '铜线断线停机保护触发' },
      { org: EQ_ORG, no: '2026111000017', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-11 20:17:20', dtype: '维修', code: '1020000080', name: 'B线高频电阻焊机', fault: '功能性不良', part: '整体', level: '一般', reporter: '邓先元', rtime: '2026-11-10 19:02:11', repairman: '刘起飞', dept: '0405_生产部', loc: '制罐B线', result: '已修复', etime: '2026-11-11 20:17:20', phenom: '焊接变压器水温偏高预警' },
      { org: EQ_ORG, no: '2026111000015', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-11 19:02:20', dtype: '维修', code: '1020000138', name: 'B线收罐机', fault: '故障停机', part: '整体', level: '重要', reporter: '谢吉飞', rtime: '2026-11-10 16:30:45', repairman: '莫立连', dept: '0405_生产部', loc: '制罐B线', result: '已修复', etime: '2026-11-11 19:02:20', phenom: '出罐光电开关误报满罐停机' },
      { org: EQ_ORG, no: '2026111000016', status: '已关结', verify: '已修复', audit: '已审核', star: '2026-11-11 17:02:20', dtype: '维修', code: '1020000080', name: 'B线高频电阻焊机', fault: '高低位置不对', part: '输送一', level: '一般', reporter: '刘起飞', rtime: '2026-11-10 15:22:08', repairman: '邓先元', dept: '0405_生产部', loc: '制罐B线', result: '已修复', etime: '2026-11-11 17:02:20', phenom: '导轨高度偏差需重新校准' },
      { org: EQ_ORG, no: '2026111000011', status: '待接单', verify: '', audit: '待审核', star: '', dtype: '维修', code: '1020000122', name: 'E线封口机', fault: '功能性不良', part: '整体', level: '紧急', reporter: '杨华勇', rtime: '2026-11-10 14:10:36', repairman: '', dept: '0405_生产部', loc: '制罐E线', result: '', etime: '', phenom: '二道卷封滚轮跳动异常' },
      ...mkRows(30, (i) => {
        const status = pickAt(['已关结', '已关结', '维修中', '待接单'], i);
        const closed = status === '已关结';
        return {
          org: EQ_ORG,
          no: `20261110${pad(5 + i, 5)}`,
          status,
          verify: closed ? '已修复' : '',
          audit: closed ? '已审核' : '待审核',
          star: closed ? `2026-11-1${(i % 2) + 1} ${pad(9 + (i % 10))}:20:11` : '',
          dtype: '维修',
          code: pickAt(EQ_NUMS, i),
          name: pickAt(EQ_NAMES, i),
          fault: pickAt(['功能性不良', '故障停机', '高低位置不对', '其他'], i),
          part: pickAt(['整体', '输送一', '缩颈', '上料系统'], i),
          level: pickAt(['一般', '重要', '紧急'], i),
          reporter: pickAt(['李元龙', '刘起飞', '朱和全', '谢吉飞', '杨华勇'], i),
          rtime: '2026-11-10 13:00:00',
          repairman: closed ? pickAt(['黄田兴', '邓先元', '包小浩', '莫立连'], i) : '',
          dept: '0405_生产部',
          loc: pickAt(['制罐A线', '制罐B线', '制罐D线', '制罐E线'], i),
          result: closed ? '已修复' : '',
          etime: closed ? '2026-11-11 16:47:20' : '',
          phenom: '产线例行巡检上报设备运行异常',
        };
      }),
    ],
    kbList: [
      ['1020000067', 'A线高频电阻焊机', '电阻焊机', '高低位置不对', '输送一', '罐体输送异常推爪推不到'],
      ['1020000076', 'A线组合式提升机', '提升机', '故障停机', '整体', '故障停机'],
      ['1020000031', 'A线全自动送盖机一拖一', '自动加盖机', '其他', '上料系统', '其他'],
      ['1020000139', 'A线缩颈反边机', '缩颈翻边组合机', '其他', '缩颈', '其他'],
      ['1020000067', 'A线高频电阻焊机', '电阻焊机', '故障停机', '整体', '故障停机'],
      ['1020000067', 'A线高频电阻焊机', '电阻焊机', '开机准备', '整体', '开机准备'],
    ].map((r) => ({
      org: EQ_ORG,
      code: r[0],
      name: r[1],
      type: r[2],
      model: r[0],
      spare: '',
      fcode: r[3],
      part: r[4],
      phenom: r[5],
    })),
    sparePurchase: mkRows(30, (i) => {
      const fixedNos = ['5200024579', '5200024541', '5300023265', '5200024511', '5300023264', '5300023263', '5200024510'];
      return {
        org: EQ_ORG,
        no: fixedNos[i] || `52000245${pad(80 + i)}`,
        ptype: pickAt(['非生产性物料采购', '费用采购'], i),
        attach: i % 3 === 0 ? '附件' : '',
        status: pickAt(['开立', '开立', '操作中', '关结'], i),
        dept: '中山制罐管理员',
        creator: '中山制罐管理员',
        urgent: i % 5 === 0 ? '紧急' : '一般',
        ctime: `2026-11-${pad(17 + (i % 3))} ${pad(8 + (i % 10))}:${pad((i * 11) % 60)}:${pad((i * 17) % 60)}`,
      };
    }),
    spareIn: [
      ['5310003458', '批量', '孙运妹', 'YHP01650', '烘炉纠偏铜套', '', '26B1900005'],
      ['5310003458', '批量', '孙运妹', 'YHP01651', '烘炉纠偏螺杆', '', '26B1900004'],
      ['5300022998', '批量', '孙运妹', 'YHP01665', '聚氨酯带钢PU同步带', 'HTD-8M-30MM', '26B1900003'],
      ['5200022830', '批量', '孙运妹', '50080374', '光电传感器,E3FB-DN23,NPN,12-24V', '', '26B1900002'],
      ['5310003492', '批量', '孙运妹', 'YHP01672', '维修铜线压遍箱，更换油封、两条轴', '', '26B1900001'],
      ['5300022807', '批量', '孙运妹', 'YHP00510', '盐酸', '', '20261102'],
      ...mkRows(20, (i) => [
        `52000240${pad(70 + i)}`,
        i % 2 === 0 ? '个体' : '批量',
        pickAt(['孙运妹', '莫立连', '黄文敬'], i),
        pickAt(['50052886', '50065253', '50081038', 'YHP01637'], i),
        pickAt(['感应器,XS618B1PAM12', '熔断器,RT36-00 80A', '三角带,A710Li', '纯棉纱'], i),
        '',
        `26B13000${pad(14 + i)}`,
      ]),
    ].map((r) => ({
      org: EQ_ORG,
      no: r[0],
      type: r[1],
      user: r[2],
      code: r[3],
      mat: r[3],
      name: r[4],
      spec: r[5],
      batch: r[6],
    })),
    spareStock: [
      ['26B1900005', 'YHP01650', '烘炉纠偏铜套', '', '备件', 3, '备件库', 'B-01-02'],
      ['26B1900004', 'YHP01651', '烘炉纠偏螺杆', '', '备件', 2, '备件库', 'B-01-03'],
      ['26B1900003', 'YHP01665', '聚氨酯带钢PU同步带', 'HTD-8M-30MM', '备件', 18, '备件库', 'B-02-01'],
      ['26B1900002', '50080374', '光电传感器,E3FB-DN23,NPN,12-24V', '', '备件', 26, '主仓库', 'A-04-08'],
      ['26B1900001', 'YHP01672', '维修铜线压遍箱，更换油封、两条轴', '', '备件', 12, '备件库', 'B-03-04'],
      ['20261102', 'YHP00510', '盐酸', '', '备件', 45, '危化品库', 'C-01-01'],
      ['26B1300014', '50052886', '感应器,XS618B1PAM12', '', '备件', 34, '主仓库', 'A-04-09'],
      ['26B1300013', '50065253', '熔断器,RT36-00 80A', '', '备件', 62, '主仓库', 'A-02-05'],
      ['26B1300012', '50081038', '三角带,A710Li', '', '备件', 28, '备件库', 'B-05-02'],
      ['26B1300011', '90010034', '木柄油灰刀3寸 12支/包', '', '备件', 19, '备件库', 'B-06-01'],
      ...mkRows(20, (i) => [
        `26B1300${pad(10 + i, 4)}`,
        pickAt(['90008730', 'YHP01637', '50010021'], i),
        pickAt(['木柄油灰刀2寸 12支/包', '纯棉纱', '轴承6305'], i),
        '',
        '备件',
        10 + ((i * 7) % 45),
        pickAt(['主仓库', '备件库'], i),
        `B-0${(i % 6) + 1}-0${(i % 9) + 1}`,
      ]),
    ].map((r) => ({
      org: EQ_ORG,
      batch: String(r[0]),
      code: String(r[1]),
      mat: String(r[1]),
      name: String(r[2]),
      spec: String(r[3]),
      cat: String(r[4]),
      qty: Number(r[5]),
      wh: String(r[6]),
      loc: String(r[7]),
      fee: '备件费用',
    })),
    spareCheck: [
      ['2026111900001', '关结', '4', '4.0', '孙运妹', '2026-11-19 09:30:36', '2026-11-19 09:31:56', '孙运妹', '2026-11-19 13:56:27'],
      ['2026013100001', '盘点中', '1332', '108.0', '孙运妹', '2026-02-02 09:05:56', '', '', ''],
      ['2026010800001', '盘点中', '1359', '4.0', '孙运妹', '2026-01-21 15:19:19', '', '', ''],
      ['2026010700002', '关结', '1', '1', '孙运妹', '2026-01-07 15:04:26', '2026-01-21 15:41:41', '孙运妹', '2026-01-21 15:41:41'],
    ].map((r) => ({
      org: EQ_ORG,
      no: r[0],
      status: r[1],
      kinds: r[2],
      qty: r[3],
      user: r[4],
      stime: r[5],
      etime: r[6],
      auditor: r[7],
      atime: r[8],
    })),
    spareUse: [
      ['2026111800002', '已领用', '', '', '易耗品', '', '孙运妹', '孙运妹', '', '2026-11-18 14:05:46', ''],
      ['2026111800001', '已领用', '1020000119', 'E线高频电阻焊机', '保养', '', '黄文敬', '孙运妹', '', '2026-11-18 11:56:16', ''],
      ['2026111700001', '已领用', '1020000106', 'D线内全喷涂机', '保养', '', '谢吉飞', '莫立连', '', '2026-11-17 10:00:13', ''],
      ['2026111600004', '已领用', '', '', '易耗品', '', '杨华勇', '莫立连', '', '2026-11-16 18:25:36', ''],
      ...mkRows(15, (i) => [
        `20261115000${pad(19 - i)}`,
        pickAt(['已领用', '已领用', '审核通过', '待审核'], i),
        pickAt(EQ_NUMS, i),
        pickAt(EQ_NAMES, i),
        pickAt(['保养', '易耗品', '维修'], i),
        '',
        pickAt(['黄文敬', '谢吉飞', '杨华勇', '孙运妹'], i),
        pickAt(['孙运妹', '莫立连'], i),
        '',
        '2026-11-16 12:23:37',
        '',
      ]),
    ].map((r) => ({
      org: EQ_ORG,
      no: r[0],
      status: r[1],
      code: r[2],
      name: r[3],
      type: r[4],
      back: r[5],
      apply: r[6],
      audit: r[7],
      send: r[8],
      atime: r[9],
      rtime: r[10],
    })),
    keyComp: [
      {
        org: EQ_ORG,
        code: '1250',
        name: '下焊轮,64M-447059,Φ57',
        type: '下机',
        line: '制罐A线',
        out: '42860',
        repair: '否',
        intime: '2026-10-31 01:57:20',
        user: '张德福',
        downtime: '2026-11-19 10:50:00',
        inout: '43128',
      },
      ...mkRows(6, (i) => ({
        org: EQ_ORG,
        code: String(1251 + i),
        name: pickAt(['下焊轮,64M-447059,Φ57', '上焊轮,64M-448052,Φ47'], i),
        type: '下机',
        line: pickAt(['制罐A线', '制罐B线', '制罐D线'], i),
        out: String(32000 + i * 2850),
        repair: '否',
        intime: '2026-10-31 01:57:20',
        user: '张德福',
        downtime: '2026-11-19 10:50:00',
        inout: String(41200 + i * 1450),
      })),
    ],
    toolArchive: [
      {
        org: EQ_ORG,
        code: '52001076',
        name: '下焊轮,64M-448052',
        spec: 'Φ47',
        type: 'FBB5700U焊机',
        rule: '1',
        gen: '',
        creator: '汪家周',
        ctime: '2025-04-11 17:17:26',
        modifier: '',
      },
      {
        org: EQ_ORG,
        code: '52001084',
        name: '下焊轮,64M-447059,Φ57',
        spec: '',
        type: '其他',
        rule: '1',
        gen: '工装条码',
        creator: '汪家周',
        ctime: '2025-04-11 17:14:30',
        modifier: '',
      },
    ],
    toolLedger: [],
    toolScrap: [],
    toolHistory: [],
    energy: mkRows(40, (i) => {
      const etype = pickAt(['电能', '压缩空气', '水', '蒸汽'], i);
      const unitMap: Record<string, string> = { 电能: 'kWh', 压缩空气: 'm³', 水: '吨', 蒸汽: '吨' };
      const val = 180 + ((i * 237) % 2680);
      const cost = Math.round(val * (etype === '电能' ? 0.78 : etype === '压缩空气' ? 0.22 : 3.6));
      return {
        org: EQ_ORG,
        date: `2026-11-${pad(1 + (i % 18))}`,
        dept: pickAt(['生产部', '设备部', '品管部', '工程部'], i),
        eq: pickAt(EQ_NAMES, i),
        type: etype,
        val,
        unit: unitMap[etype],
        cost,
      };
    }),
  };
}

export const EQ_PAGES: Record<string, EqPageConfig> = {
  home: { id: 'home', type: 'home', title: '设备管理首页' },
  board: { id: 'board', type: 'board', title: '设备管理看板' },
  mttr: { id: 'mttr', type: 'chart', title: 'MTTR' },
  mtbf: { id: 'mtbf', type: 'chart', title: 'MTBF' },

  team: {
    id: 'team',
    type: 'table',
    title: '班组管理',
    pageSize: 10,
    total: 12,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      OP('班组编码', 'code'),
      OP('班组名称', 'name'),
      OP('所属部门', 'dept', ['请选择', '生产部', '设备部', '品管部', '工程部']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('班组编码', 'code', { sort: true }),
      COL('班组名称', 'name', { sort: true }),
      COL('所属部门', 'dept'),
      COL('班组长', 'leader'),
      COL('人数', 'count', { sort: true }),
      COL('班次', 'shift'),
      COL('状态', 'status', { tag: true }),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '删除'],
    buttons: ['+新增', '-批量删除', '导入', '导出'],
  },

  bom: {
    id: 'bom',
    type: 'table',
    title: '设备BOM',
    pageSize: 10,
    total: 119,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      OP('设备型号', 'model', ['请选择']),
      OP('设备类型', 'type', ['请选择']),
      OP('设备类别', 'cat', ['请选择']),
      OP('设备资产编号', 'code'),
      OP('安装地点', 'loc'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('设备资产编号', 'code', { sort: true }),
      COL('设备类别', 'cat'),
      COL('设备类型', 'type'),
      COL('设备型号', 'model'),
      COL('操作', '_op'),
    ],
    actions: ['备件关联', '工装关联'],
    buttons: [],
    subtabs: ['设备关联', '备件', '工装'],
    subCols: [
      COL('设备编号', 'code'),
      COL('设备名称', 'name'),
      COL('制造厂', 'maker'),
      COL('使用部门名称', 'dept'),
      COL('地点', 'loc'),
    ],
  },

  faultList: {
    id: 'faultList',
    type: 'table',
    title: '故障明细表',
    pageSize: 10,
    total: 944,
    search: [
      SEL('组织机构', 'org', ['', EQ_ORG]),
      OP('设备类型', 'name'),
      OP('故障现象', 'phenom'),
      OP('故障原因', 'cause'),
      OP('故障代码', 'fcode'),
      OP('故障部位', 'part'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('故障编码', 'code'),
      COL('设备类型', 'name'),
      COL('故障代码', 'fcode'),
      COL('故障现象', 'phenom'),
      COL('故障原因', 'cause'),
      COL('故障原因代码', 'ccode'),
      COL('维修方式', 'fix'),
      COL('操作', '_op'),
    ],
    actions: ['修改'],
    buttons: ['添加', '删除', '导入', '导出'],
  },

  eqTypePart: {
    id: 'eqTypePart',
    type: 'table',
    title: '设备类型部位',
    pageSize: 10,
    total: 24,
    search: [
      SEL('组织机构', 'org', ['', EQ_ORG]),
      OP('设备类型', 'type', ['请选择']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('设备类型', 'type'),
      COL('操作', '_op'),
    ],
    actions: ['修改'],
    buttons: ['新增', '删除'],
    subtabs: ['设备类型', '设备部位'],
    subCols: [COL('设备部位', 'part'), COL('操作', '_op')],
  },

  ledger: {
    id: 'ledger',
    type: 'table',
    title: '设备台账',
    pageSize: 10,
    total: 119,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      OP('设备名称', 'name'),
      OP('设备编码', 'code'),
      OP('存放位置', 'loc'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('设备编码', 'code', { sort: true }),
      COL('设备状态', 'status', { tag: true, sort: true }),
      COL('设备类别', 'cat', { sort: true }),
      COL('设备名称', 'name', { sort: true }),
      COL('设备型号', 'model', { sort: true }),
      COL('设备类型', 'type', { sort: true }),
      COL('制造厂商', 'maker', { sort: true }),
      COL('出厂年月', 'date', { sort: true }),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '更多'],
    buttons: ['+新增', '-批量删除', '导入', '导出', '导出点检保养'],
  },

  maintainPlan: {
    id: 'maintainPlan',
    type: 'table',
    title: '保养计划',
    pageSize: 10,
    total: 495,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      ALL('计划类型', 'ptype', ['临时保养', '周期', '保养间隔', '生产次数']),
      ALL('保养周期', 'cycle', ['4小时', '生产2天', '小时', '日', '半月', '两月', '生产7天', '周', '月', '季度', '半年', '全年', '四个月']),
      OP('计划名称', 'name'),
      OP('设备编码', 'code'),
      OP('设备名称', 'eq'),
      OP('生产次数', 'num'),
      OP('保养人员', 'staff'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('计划名称', 'name'),
      COL('设备编号', 'code'),
      COL('设备名称', 'eq'),
      COL('设备类型', 'type'),
      COL('设备型号', 'model'),
      COL('使用部门', 'dept'),
      COL('保养人员', 'staff'),
      COL('计划状态', 'status', { tag: true }),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '删除'],
    buttons: ['+新增', '-批量删除'],
  },

  checkPlan: {
    id: 'checkPlan',
    type: 'table',
    title: '检验计划',
    pageSize: 10,
    total: 495,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      OP('设备名称', 'name'),
      OP('设备编号', 'code'),
      OP('计划类型', 'ptype', ['请选择']),
      OP('检验人员', 'user'),
      OP('计划名称', 'plan'),
      OP('计划状态', 'status', ['请选择']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('设备编号', 'code'),
      COL('设备名称', 'name'),
      COL('设备类别', 'cat'),
      COL('设备类型', 'type'),
      COL('设备型号', 'model'),
      COL('计划状态', 'status', { tag: true }),
      COL('计划名称', 'plan'),
      COL('计划类型', 'ptype'),
      COL('周期', 'cycle'),
      COL('周期类型', 'ctype'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '删除'],
    buttons: ['+新增', '-批量删除', '计划关结'],
    subtabs: ['检验计划', '维护项目'],
    subCols: [
      COL('所属部位', 'part'),
      COL('项目描述', 'desc'),
      COL('维护方法', 'method'),
      COL('计划工时', 'hours'),
      COL('值域', 'range'),
      COL('上限值', 'max'),
      COL('下限值', 'min'),
      COL('单位', 'unit'),
    ],
  },

  maintain: {
    id: 'maintain',
    type: 'table',
    title: '设备保养',
    pageSize: 10,
    total: 1200,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('创建时间'),
      DATE('保养完成时间'),
      OP('单据状态', 'status', ['请选择']),
      OP('保养工单号', 'no'),
      OP('设备编号', 'code'),
      OP('设备名称', 'name'),
      OP('保养人员', 'user', ['请选择']),
      OP('周期名称', 'cycle', ['请选择']),
      OP('计划名称', 'plan'),
      OP('线别', 'line', ['请选择']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('保养工单号', 'no'),
      COL('单据状态', 'status', { tag: true }),
      COL('是否生产', 'produce', { tag: true }),
      COL('周期名称', 'cycle', { tag: true }),
      COL('计划名称', 'plan'),
      COL('设备编号', 'code'),
      COL('线别', 'line'),
      COL('设备名称', 'name'),
      COL('设备型号', 'model'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '编辑'],
    buttons: ['保养导出', '一键未生产', '保养报表', '删除'],
    subtabs: ['执行记录', '保养项目', '更换备件'],
    subCols: [
      COL('保养工单号', 'no'),
      COL('项目', 'item'),
      COL('结果', 'result'),
      COL('保养人', 'user'),
    ],
  },

  inspect: {
    id: 'inspect',
    type: 'table',
    title: '设备点检/巡检',
    pageSize: 10,
    total: 1100,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('创建时间', 'ctime'),
      OP('单据类型', 'type', ['请选择']),
      OP('单据状态', 'status', ['请选择']),
      OP('检验单号', 'no'),
      OP('设备编号', 'code'),
      OP('设备名称', 'name'),
      OP('计划名称', 'plan'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('检验工单号', 'no'),
      COL('单据状态', 'status', { tag: true }),
      COL('是否生产', 'produce', { tag: true }),
      COL('单据类型', 'type'),
      COL('计划名称', 'plan'),
      COL('创建时间', 'ctime'),
      COL('检验完成时间', 'etime'),
      COL('设备编号', 'code'),
      COL('设备名称', 'name'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '编辑'],
    buttons: ['点检导出', '一键未生产', '报表'],
    subtabs: ['执行记录', '检验项目'],
    subCols: [
      COL('检验工单号', 'no'),
      COL('项目', 'item'),
      COL('结果', 'result'),
      COL('点检人', 'user'),
    ],
  },

  repair: {
    id: 'repair',
    type: 'table',
    title: '设备维修',
    pageSize: 10,
    total: 216,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('报修时间', 'rtime'),
      DATE('维修结束时间', 'etime'),
      OP('维修工单号', 'no'),
      OP('设备编号', 'code'),
      OP('单据状态', 'status', ['请选择']),
      OP('故障类别', 'fault', ['请选择']),
      OP('报修人', 'reporter'),
      OP('维修人', 'repairman'),
      OP('申请部门', 'dept'),
      OP('产品质量确认', 'verify', ['请选择']),
      OP('存放位置', 'loc', ['请选择']),
      OP('故障原因', 'phenom'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('维修工单号', 'no'),
      COL('单据状态', 'status', { tag: true }),
      COL('验证结果', 'verify', { tag: true }),
      COL('审核状态', 'audit', { tag: true }),
      COL('星级评价时间', 'star'),
      COL('单据类型', 'dtype'),
      COL('设备编码', 'code'),
      COL('设备名称', 'name'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '审核', '更多'],
    buttons: ['故障报修', '-批量删除', '导出', '测试推送', '线长审核', '主任审核', '工程经理审核'],
    subtabs: ['执行记录', '更换备件'],
    subCols: [
      COL('操作类型', 'otype'),
      COL('操作人', 'user'),
      COL('操作时间', 'time'),
    ],
  },

  kbList: {
    id: 'kbList',
    type: 'table',
    title: '维修知识库',
    pageSize: 10,
    total: 6,
    search: [
      SEL('组织机构', 'org', ['', EQ_ORG]),
      DATE('创建时间'),
      OP('设备名称', 'name'),
      OP('故障现象', 'phenom'),
      OP('故障编码', 'fcode'),
      OP('设备型号', 'model', ['请选择']),
      OP('故障部位', 'part', ['请选择']),
    ],
    statRow: [
      { label: '知识库数量', value: 6 },
      { label: '被采用条数', value: 2 },
      { label: '故障类型', value: 5 },
      { label: '涉及设备类型', value: 4 },
      { label: '涉及设备数量', value: 3 },
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('设备编码', 'code'),
      COL('设备名称', 'name'),
      COL('设备类型', 'type'),
      COL('设备型号', 'model'),
      COL('更换备件', 'spare'),
      COL('故障编码', 'fcode'),
      COL('故障部位', 'part'),
      COL('故障现象', 'phenom'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '删除'],
    buttons: ['+新增', '-批量删除', '导入', '导出'],
  },

  sparePurchase: {
    id: 'sparePurchase',
    type: 'table',
    title: '备件采购',
    pageSize: 10,
    total: 138,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('创建时间', 'ctime'),
      ALL('状态', 'status', ['开立', '操作中', '关结']),
      OP('采购单号', 'no'),
      OP('申请部门', 'dept', ['请选择']),
      OP('采购订单类型', 'ptype', ['请选择']),
      OP('备件料号', 'code'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('采购单号', 'no'),
      COL('采购订单类型', 'ptype'),
      COL('附件', 'attach'),
      COL('状态', 'status', { tag: true }),
      COL('申请部门', 'dept'),
      COL('创建人', 'creator'),
      COL('紧急标志', 'urgent', { tag: true }),
      COL('创建时间', 'ctime'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '删除'],
    buttons: ['+新增', '-批量删除', '导入', '导出', '同步'],
  },

  spareIn: {
    id: 'spareIn',
    type: 'table',
    title: '备件入库',
    pageSize: 10,
    total: 88,
    search: [
      SEL('组织机构', 'org', ['', EQ_ORG]),
      ALL('入库类型', 'type', ['个体', '批量']),
      DATE('生产日期'),
      DATE('入库时间'),
      OP('入库人员', 'user', ['请选择']),
      OP('采购单号', 'no'),
      OP('备件编号', 'code'),
      OP('备件名称', 'name'),
      OP('备件料号', 'mat'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('采购单号', 'no'),
      COL('备件编码', 'code'),
      COL('入库类型', 'type', { tag: true }),
      COL('入库员', 'user'),
      COL('备件料号', 'mat'),
      COL('备件名称', 'name'),
      COL('备件规格', 'spec'),
      COL('批次号', 'batch'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改'],
    buttons: ['条码打印预览', '+新增', '-批量删除', '打印', '导出'],
  },

  spareStock: {
    id: 'spareStock',
    type: 'table',
    title: '备件库存',
    pageSize: 10,
    total: 1600,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('创建时间'),
      OP('备件编码', 'code', ['请选择']),
      OP('备件名称', 'name'),
      OP('备件料号', 'mat', ['请选择']),
      OP('批次号', 'batch'),
      OP('费用类别', 'fee', ['请选择']),
      OP('仓库', 'wh', ['请选择']),
      OP('物料数量', 'qty'),
      OP('物料规格', 'spec'),
      OP('库位', 'loc'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('备件编码', 'code'),
      COL('批次号', 'batch'),
      COL('备件料号', 'mat'),
      COL('备件名称', 'name'),
      COL('备件规格', 'spec'),
      COL('库存类别', 'cat'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '库位移动', '料号转换'],
    buttons: ['导出', '导入', '删除', '导出的(新)', '打印'],
    subtabs: ['库存明细', '库存汇总信息'],
    subCols: [
      COL('备件料号', 'mat'),
      COL('备件名称', 'name'),
      COL('规格', 'spec'),
      COL('库存数量', 'qty'),
      COL('仓库', 'wh'),
    ],
  },

  spareCheck: {
    id: 'spareCheck',
    type: 'table',
    title: '备件盘点',
    pageSize: 10,
    total: 4,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('创建时间', 'stime'),
      DATE('计划盘点时间'),
      ALL('状态', 'status', ['待接单', '待盘点', '盘点中', '已完成', '待审核', '关结']),
      OP('盘点人', 'user'),
      OP('盘点单号', 'no'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('盘点单号', 'no'),
      COL('单据状态', 'status', { tag: true }),
      COL('已盘点料号种数', 'kinds'),
      COL('已盘点数量', 'qty'),
      COL('盘点人', 'user'),
      COL('盘点开始时间', 'stime'),
      COL('盘点结束时间', 'etime'),
      COL('审核人', 'auditor'),
      COL('审核时间', 'atime'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '盘点'],
    buttons: ['+新增', '-批量删除'],
    subtabs: ['备件清单', '备件明细', '执行记录'],
    subCols: [
      COL('备件料号', 'mat'),
      COL('备件名称', 'name'),
      COL('备件规格', 'spec'),
      COL('状态', 'status'),
      COL('库存数量', 'qty'),
      COL('盘点数量', 'cqty'),
      COL('盘点盈亏', 'diff'),
    ],
  },

  spareUse: {
    id: 'spareUse',
    type: 'table',
    title: '备件领用',
    pageSize: 10,
    total: 60,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      ALL('单据状态', 'status', ['待审核', '审核通过', '审核拒绝', '待领用', '已领用', '关结']),
      DATE('申请时间', 'atime'),
      OP('领用类型', 'type', ['请选择']),
      OP('关联设备', 'code'),
      OP('领用单号', 'no'),
      OP('申请人', 'apply'),
      OP('审核人', 'audit'),
      OP('关联单号', 'rel'),
      OP('备件料号', 'mat'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('领用单号', 'no'),
      COL('单据状态', 'status', { tag: true }),
      COL('关联设备', 'code'),
      COL('设备名称', 'name'),
      COL('领用类型', 'type'),
      COL('归还时间', 'back'),
      COL('申请人', 'apply'),
      COL('审核人', 'audit'),
      COL('发料人', 'send'),
      COL('申请时间', 'atime'),
      COL('审核时间', 'rtime'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改'],
    buttons: ['审核通过', '+新增', '-批量删除', '备件领用OA申请', '导出'],
    subtabs: ['备件明细', '执行记录'],
    subCols: [
      COL('备件料号', 'mat'),
      COL('备件名称', 'name'),
      COL('数量', 'qty'),
    ],
  },

  keyComp: {
    id: 'keyComp',
    type: 'table',
    title: '关键组件',
    pageSize: 10,
    total: 7,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      OP('工装编码', 'code'),
      OP('操作类型', 'type', ['请选择']),
      OP('产线', 'line', ['请选择']),
      OP('是否外修', 'repair', ['请选择']),
      OP('组件名称', 'name', ['请选择']),
      OP('下机时间', 'downtime'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('工装编码', 'code'),
      COL('组件名称', 'name'),
      COL('操作类型', 'type'),
      COL('产线', 'line'),
      COL('上机产量/万罐', 'out', { sort: true }),
      COL('是否外修', 'repair', { tag: true }),
      COL('上机时间', 'intime'),
      COL('上机人', 'user'),
      COL('下机时间', 'downtime'),
      COL('下机产量/万罐', 'inout', { sort: true }),
      COL('操作', '_op'),
    ],
    actions: ['删除', '修改', '下机'],
    buttons: ['添加', '删除', '修改', '外修', '导出'],
  },

  toolArchive: {
    id: 'toolArchive',
    type: 'table',
    title: '工装建档',
    pageSize: 10,
    total: 2,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      OP('工装料号', 'code'),
      OP('工装名称', 'name'),
      OP('工装类型', 'type', ['请选择']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('工装料号', 'code'),
      COL('工装名称', 'name'),
      COL('工装规格', 'spec'),
      COL('工装类型', 'type'),
      COL('条码校验规则', 'rule'),
      COL('条码生成规则', 'gen'),
      COL('创建人', 'creator'),
      COL('创建时间', 'ctime'),
      COL('修改人', 'modifier'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改', '删除'],
    buttons: ['+新增', '-批量删除'],
  },

  toolLedger: {
    id: 'toolLedger',
    type: 'table',
    title: '工装台账',
    pageSize: 10,
    total: 0,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('入库时间'),
      ALL('状态', 'status', ['维修确认', '在库', '上线', '报废', '禁用', '故障']),
      ALL('保养状态', 'maint', ['正常', '到期', '过期']),
      OP('工装名称', 'name'),
      OP('工装编码', 'code'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('工装编码', 'code'),
      COL('状态', 'status', { tag: true }),
      COL('保养状态', 'maint', { tag: true }),
      COL('工装料号', 'mat'),
      COL('工装名称', 'name'),
      COL('工装规格', 'spec'),
      COL('工装类型', 'type'),
      COL('供应商', 'supplier'),
      COL('操作', '_op'),
    ],
    actions: ['查看', '修改'],
    buttons: ['+新增', '-批量删除', '导入', '导出', '禁用', '解禁', '维修', '维修确认', '报废'],
  },

  toolScrap: {
    id: 'toolScrap',
    type: 'table',
    title: '工装报废',
    pageSize: 10,
    total: 0,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('报废时间', 'time'),
      OP('工装编码', 'code'),
      OP('工装料号', 'mat'),
      OP('报废类型', 'type', ['请选择']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('工装编码', 'code'),
      COL('工装料号', 'mat'),
      COL('报废人', 'user'),
      COL('报废时间', 'time'),
      COL('报废类型', 'type'),
      COL('报废原因', 'reason'),
      COL('工装名称', 'name'),
      COL('工装规格', 'spec'),
      COL('工装类型', 'etype'),
    ],
    actions: [],
    buttons: ['新增报废', '导出'],
  },

  toolHistory: {
    id: 'toolHistory',
    type: 'table',
    title: '工装履历',
    pageSize: 10,
    total: 0,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      ALL('工装状态', 'status', ['维修确认', '在库', '上线', '报废', '禁用', '故障']),
      ALL('操作类型', 'otype', ['入库', '禁用', '解禁', '报废']),
      OP('工装编码', 'code'),
      OP('工装料号', 'mat'),
      OP('工装类型', 'type', ['请选择']),
      OP('供应商', 'supplier'),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('工装编码', 'code'),
      COL('工装状态', 'status', { tag: true }),
      COL('工装料号', 'mat'),
      COL('工装类型', 'type'),
      COL('工装规格', 'spec'),
      COL('操作类型', 'otype'),
      COL('供应商', 'supplier'),
      COL('操作', '_op'),
    ],
    actions: ['查看'],
    buttons: [],
    subtabs: ['操作履历', '维修履历', '保养履历'],
    subCols: [
      COL('工装编码', 'code'),
      COL('操作类型', 'otype'),
      COL('时间', 'time'),
      COL('操作人', 'user'),
    ],
  },

  energy: {
    id: 'energy',
    type: 'table',
    title: '能耗明细表',
    pageSize: 10,
    total: 40,
    search: [
      SEL('组织机构', 'org', [EQ_ORG]),
      DATE('抄表时间', 'date'),
      OP('部门', 'dept', ['请选择']),
      OP('设备', 'eq'),
      OP('能源类型', 'type', ['请选择']),
    ],
    cols: [
      COL('', '_cb', { cb: true }),
      COL('组织机构', 'org'),
      COL('日期', 'date', { sort: true }),
      COL('部门', 'dept'),
      COL('设备', 'eq'),
      COL('能源类型', 'type', { tag: true }),
      COL('用量', 'val', { sort: true }),
      COL('单位', 'unit'),
      COL('费用(元)', 'cost', { sort: true }),
    ],
    actions: [],
    buttons: ['导出'],
  },
};

export const EQ_HOME_STATUS_DATA = [
  { name: '在用', value: 92, color: '#165DFF' },
  { name: '维修中', value: 25, color: '#EA580C' },
  { name: '待启用', value: 24, color: '#F59E0B' },
  { name: '封存', value: 1, color: '#10B981' },
];

export const EQ_HOME_FAULT_SERIES: Record<'day' | 'week' | 'month', Array<{ name: string; value: number }>> = {
  day: [
    { name: '11-06', value: 24 },
    { name: '11-07', value: 2 },
    { name: '11-08', value: 1 },
    { name: '11-09', value: 1 },
    { name: '11-10', value: 16 },
    { name: '11-11', value: 0 },
    { name: '11-12', value: 0 },
    { name: '11-13', value: 1 },
    { name: '11-14', value: 0 },
    { name: '11-15', value: 0 },
  ],
  week: [
    { name: 'W40', value: 18 },
    { name: 'W41', value: 22 },
    { name: 'W42', value: 14 },
    { name: 'W43', value: 29 },
    { name: 'W44', value: 19 },
    { name: 'W45', value: 26 },
    { name: 'W46', value: 17 },
  ],
  month: [
    { name: '5月', value: 20 },
    { name: '6月', value: 14 },
    { name: '7月', value: 25 },
    { name: '8月', value: 19 },
    { name: '9月', value: 16 },
    { name: '10月', value: 23 },
    { name: '11月', value: 17 },
  ],
};

export const EQ_BOARD_CATEGORY_DATA = [
  { name: '制罐', value: 38, color: '#165DFF' },
  { name: '贴标', value: 26, color: '#2563EB' },
  { name: '空压', value: 18, color: '#0EA5E9' },
  { name: '输送', value: 22, color: '#10B981' },
  { name: '检测', value: 16, color: '#F59E0B' },
  { name: '其他', value: 22, color: '#64748B' },
];

export const EQ_BOARD_TREND_LABELS = [
  '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月',
];

export const EQ_BOARD_TREND_VALUES = [18, 22, 15, 28, 20, 14, 25, 19, 16, 23, 17, 12];

export const EQ_METRIC_CONFIGS = {
  mttr: {
    title: '平均维修时长 MTTR (小时)',
    unit: 'h',
    data: [4.2, 3.8, 5.1, 4.6, 3.2, 4.8, 5.5, 4.1, 3.6, 4.4, 3.9, 4.3],
    goal: 4,
    yoy: '+3.2%',
  },
  mtbf: {
    title: '平均故障间隔 MTBF (小时)',
    unit: 'h',
    data: [168, 182, 175, 190, 205, 198, 212, 220, 208, 225, 218, 230],
    goal: 200,
    yoy: '+3.2%',
  },
};
