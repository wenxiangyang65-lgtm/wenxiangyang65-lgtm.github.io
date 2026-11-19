const screenWork = {
  onSite: [
    {
      id: 'campaign-cards',
      cover: 'cover-d11',
      title: '双十一 · 陈先生金色卡牌',
      note: '中屏突出陈先生与王牌，两翼依次展开品牌卡牌。拍摄道具沿用同一套卡面。',
      design: {key:'card-stage-opening', title:'裸眼三联 · 开场动效', video:true},
      live: {key:'card-venue-motion', title:'现场画面 · AI 动态处理', video:true},
      liveLabel: '现场与 AI 动态',
      reels: [
        {key:'card-stage-hold', title:'裸眼三联 · 持续动效', video:true},
        {key:'card-ai-scene', title:'陈先生出镜 · 卡牌 AI 镜头', video:true},
        {key:'card-venue-reference', title:'现场屏显效果参考'}
      ],
      materials: [
        {key:'card-prop-ace', title:'王牌主视觉'},
        {key:'card-prop-title', title:'双十一主题卡'},
        {key:'card-prop-back', title:'卡牌背面'}
      ],
      brandCards: [
        {key:'card-prop-huawei', title:'华为'},
        {key:'card-prop-mengniu', title:'蒙牛'},
        {key:'card-prop-luckin', title:'瑞幸'},
        {key:'card-prop-keep', title:'Keep'},
        {key:'card-prop-oppo', title:'OPPO'},
        {key:'card-prop-yili', title:'伊利'},
        {key:'card-prop-zuoyebang', title:'作业帮'},
        {key:'card-prop-huaxia', title:'华夏之路'},
        {key:'card-prop-kaerdun', title:'卡尔顿'},
        {key:'card-prop-junlebao', title:'君乐宝'},
        {key:'card-prop-yinsuo', title:'因硕'},
        {key:'card-prop-huishiman', title:'惠诗曼'},
        {key:'card-prop-derucci', title:'慕思'},
        {key:'card-prop-quaker', title:'桂格'},
        {key:'card-prop-oppein', title:'欧派'},
        {key:'card-prop-telunsu', title:'特仑苏'},
        {key:'card-prop-cheers', title:'芝华仕'},
        {key:'card-prop-adopt-a-cow', title:'认养一头牛'},
        {key:'card-prop-master-bao', title:'鲍师傅'}
      ]
    },
    {
      id: 'campaign-chess',
      cover: 'cover-d11',
      title: '双十一 · 金狮与象棋',
      note: '金狮与王棋落在中屏，棋子沿两翼展开。',
      design: {key:'motion-chess', title:'三联动效', video:true},
      live: {key:'onsite-d11-chess', title:'现场照片 · 顶屏与队列正面'}
    },
    {
      id: 'campaign-xujie-crown',
      cover: 'cover-d11',
      title: '双十一 · 徐杰皇冠裸眼',
      note: '红宝石皇冠居中，左右异形屏延续晶体边框。',
      design: {key:'xujie-crown-stage', title:'红宝石皇冠 · 裸眼动效', video:true},
      live: {key:'xujie-crown-venue', title:'皇冠屏 · 现场效果片', video:true},
      liveLabel: '现场效果',
      materials: [{key:'xujie-crown-design', title:'皇冠三联 · 静态效果稿'}],
      materialsTitle: '设计效果稿'
    },
    {
      id: 'campaign-d11',
      cover: 'cover-d11',
      title: '双十一 · 红色狮王',
      note: '火焰狮王落在中屏，红光延伸到两翼，入场队列沿中轴经过。',
      design: {key:'motion-lion', title:'三联动效', video:true},
      live: {key:'onsite-d11-lion-photo', title:'现场照片 · 狮王顶屏与进场队列'},
      footage: {key:'onsite-d11-lion', title:'现场视频 · 三联屏与进场队列', video:true}
    },
    {
      id: 'campaign-618',
      cover: 'cover-618',
      title: '618 · 皇冠主屏',
      note: '皇冠和「品牌收官之战」位于楼梯中轴，红色动效延伸至两侧。',
      design: {key:'screen-618-crown', title:'皇冠主屏动效', video:true},
      live: {key:'onsite-618-crown', title:'现场照片 · 舞台正面'}
    },
    {
      title: '双十一 · 民生专区',
      note: '以「民生专区」标题和连续货架构成直播背景。',
      design: {key:'shelf', title:'货架场景效果稿'},
      live: {key:'onsite-d11-shelf', title:'现场照片 · 主播机位'}
    },
    {
      title: '吉林敖东',
      note: '中屏显示产品，侧墙延续蓝色水纹。',
      design: {key:'d11-aodong-triple-gapped', title:'商品屏三联交付稿'},
      live: {key:'onsite-d11-aodong', title:'现场照片 · 中屏、侧墙与展台'}
    },
    {
      title: '启高钙',
      note: '产品与标题落在中屏，两侧用草地和花朵延伸场景。',
      design: {key:'d11-calcium-triple-gapped', title:'商品屏三联交付稿'},
      live: {key:'onsite-d11-calcium', title:'现场照片 · 中屏、侧墙与展台'}
    }
  ],
  "s": [
    {
      "key": "motion-chess",
      "title": "金狮与象棋",
      "note": "初瑞雪进场主题。中屏从光束转入金狮与棋盘，两翼同时展开。",
      "video": true,
      "kind": "三联动效"
    },
    {
      "key": "motion-crown",
      "title": "红宝石皇冠",
      "note": "徐杰进场主题。红色晶体框与中屏皇冠共同建立仪式焦点。",
      "video": true,
      "kind": "三联动效"
    },
    {
      "key": "motion-cards",
      "title": "金色卡牌",
      "note": "陈先生进场主题。中屏人物与两翼卡牌做出前后层次。",
      "video": true,
      "kind": "三联动效"
    },
    {
      "key": "motion-lion",
      "title": "红色狮王",
      "note": "中央狮王与两翼红光延续活动主题。",
      "video": true,
      "kind": "三主屏拼接"
    },
    {
      "key": "motion-beacon",
      "title": "烽火台",
      "note": "旗帜、烽火和金色字样组织中屏开场。",
      "video": true,
      "kind": "三主屏拼接"
    },
    {
      "key": "chess",
      "title": "象棋效果稿",
      "note": "三联设计稿，保留屏体异形构图。"
    },
    {
      "key": "crown",
      "title": "皇冠效果稿",
      "note": "三联设计稿，保留屏体异形构图。"
    },
    {
      "key": "cards",
      "title": "卡牌效果稿",
      "note": "三联设计稿，保留屏体异形构图。"
    },
    {
      "key": "d11-preheat-xj",
      "title": "徐杰《上场》",
      "note": "鼓面、主演与舞台镜头衔接，展示徐杰预热片中的进场视觉。",
      "video": true,
      "kind": "成片节选"
    },
    {
      "key": "d11-campaign-film",
      "title": "双十一看辛选",
      "note": "人物、红色纸面和书写动作串起预热开场。",
      "video": true,
      "kind": "成片节选"
    },
    {
      "key": "d11-live-film",
      "title": "挑战全平台",
      "note": "从活动成片截取红色现场、群像与顶部屏幕的同框画面。",
      "video": true,
      "kind": "现场成片节选"
    }
  ],
  "special": [
    {key:'screen-clothing-event', title:'618 · 初辛衣奢', portrait:true, ratio:'1280 / 2588', note:'深红礼服专场主屏。', video:true, kind:'屏幕动效'},
    {key:'screen-birthday-castle', title:'初瑞雪 · 生日城堡', note:'16 楼生日专场中屏。', video:true, kind:'屏幕动效'},
    {key:'screen-themed-moon', title:'中秋 · 邀月', note:'金色月轮、嫦娥与玉兔。', kind:'圆形屏静态稿'},
    {key:'screen-themed-supermarket', title:'超级手速节 · 超市开业', note:'以科技城市场景串联货架和无人机。', kind:'横版静态稿'},
    {key:'screen-themed-store', title:'初瑞雪 · 24 小时现货店铺', note:'以购物袋与两侧品类陈列组织主屏。', kind:'中屏静态稿'},
    {
      "key": "daily-0883",
      "title": "服装专场",
      "note": "柔和背景和浅色材质衬托服装展示。"
    },
    {
      "key": "daily-0882",
      "title": "服装专场 · 草地",
      "note": "明亮的户外场景用于春夏服装主题。"
    },
    {
      "key": "live-0977",
      "title": "母婴专场",
      "note": "浅黄与草地场景贯穿主屏和侧屏。",
      "kind": "16 楼分屏交付稿"
    },
    {
      "key": "live-0908",
      "title": "618 世界杯专场",
      "note": "用球场和蓝色顶屏延续赛事主题。",
      "kind": "16 楼分屏交付稿"
    },
    {
      "key": "newyear",
      "title": "辛选年货节",
      "note": "用车队、船运与产地镜头预告年货节。",
      "video": true,
      "kind": "节日活动预热片"
    }
  ],
  "daily": [
    {
      "key": "daily-0867",
      "title": "客厅",
      "note": "以中性色室内场景承接日常商品展示。"
    },
    {
      "key": "daily-0881",
      "title": "试衣间",
      "note": "以衣架和中央通道建立纵深，给主播留出中轴站位。"
    },
    {
      "key": "daily-0865",
      "title": "中式场景",
      "note": "以木质格栅和对称背景组织画面。"
    },
    {
      "key": "live-0887",
      "title": "餐厅",
      "note": "以餐桌与落地窗作为背景。",
      "kind": "中屏画面"
    },
    {
      "key": "daily-0875",
      "title": "绿植大厅",
      "note": "用自然光与绿植裁出适合直播构图的空间。"
    },
    {
      "key": "daily-0876",
      "title": "花园",
      "note": "保留前景花卉与后方通道，营造空间层次。"
    },
    {
      "key": "daily-0871",
      "title": "欧式街道",
      "note": "用暖色建筑与街道纵深建立拍摄背景。"
    },
    {
      "key": "live-0866",
      "title": "夜上海",
      "note": "以暖色街灯和沿街建筑作为背景。",
      "kind": "中屏画面"
    },
    {
      "key": "live-0877",
      "title": "山谷草原",
      "note": "以溪流和远山拉开纵深。",
      "kind": "中屏画面"
    },
    {
      "key": "live-0879",
      "title": "草原蒙古包",
      "note": "开阔草地里用蒙古包点出场景。",
      "kind": "中屏画面"
    },
    {
      "key": "live-0873",
      "title": "海底",
      "note": "以蓝绿色水光和珊瑚作为背景。",
      "kind": "中屏画面"
    },
    {
      "key": "live-0885",
      "title": "雪景",
      "note": "用雪林与木屋表现冬季。",
      "kind": "中屏画面"
    }
  ],
  "b": [
    {
      "key": "motion-feicui-gapped",
      "title": "斐萃",
      "note": "选用蓝紫色产品屏交付稿，突出产品与品牌色。",
      "video": true,
      "kind": "三主屏拼接"
    },
    {
      "key": "motion-fish-triple-gapped",
      "title": "汤臣倍健",
      "note": "蓝金高对比突出包装，背景动效衬托中心产品。",
      "video": true,
      "kind": "三主屏拼接"
    },
    {
      "key": "fish-triple-gapped",
      "title": "鱼油 · 深色方案",
      "note": "左右商品画面与中屏同用深色展柜背景。",
      "kind": "三主屏效果图"
    },
    {
      "key": "skincare-triple-gapped",
      "title": "天气丹",
      "note": "中屏展示套盒，两翼延续浅金流线。",
      "kind": "三主屏效果图"
    },
    {
      "key": "bed-triple-gapped",
      "title": "慕思",
      "note": "中屏展示床具场景，两翼延续展厅的材质与品牌识别。",
      "kind": "三主屏效果图"
    },
    {
      "key": "screen-tian-triple-gapped",
      "title": "TianYiCui",
      "note": "产品与品牌字样集中在中屏。",
      "kind": "三主屏效果图"
    },
    {
      "key": "d11-tmj-triple-gapped",
      "title": "天美健",
      "note": "中屏展示品牌与产品，两侧保留球场场景。",
      "kind": "三主屏效果图"
    },
    {
      "key": "d11-arden-motion-triple-gapped",
      "title": "雅顿",
      "note": "两翼展示瓶身与胶囊，中屏留给品牌字样。",
      "video": true,
      "kind": "三主屏动效",
      "materials": [{key:'screen-arden-triple-gapped', title:'雅顿 · 三联效果图'}]
    },
    {
      "key": "d11-ehd-triple-gapped",
      "title": "EHD",
      "note": "展示左、中、右三块主屏的交付稿。",
      "kind": "三主屏效果图"
    },
    {
      "key": "d11-aodong-triple-gapped",
      "title": "吉林敖东",
      "note": "展示左、中、右三块主屏的交付稿。",
      "kind": "三主屏效果图"
    },
    {
      "key": "d11-calcium-triple-gapped",
      "title": "启高钙",
      "note": "展示左、中、右三块主屏的交付稿。",
      "kind": "三主屏效果图"
    }
  ],
  "ref": [
    {
      "key": "screen-xiaodu-triple-gapped",
      "title": "小度",
      "note": "同类商品屏参考。",
      "kind": "横向分屏效果图"
    },
    {
      "key": "screen-youl-triple-gapped",
      "title": "优理氏",
      "note": "同类商品屏参考。",
      "kind": "横向分屏效果图"
    },
    {
      "key": "screen-rice-triple-gapped",
      "title": "大米",
      "note": "同类商品屏参考。",
      "kind": "横向分屏效果图"
    },
    {
      "key": "screen-ear-triple-gapped",
      "title": "欧莱雅",
      "note": "横向展示同类商品屏的原始分屏。",
      "kind": "横向分屏效果图"
    },
    {
      "key": "screen-ardenref-triple-gapped",
      "title": "雅顿",
      "note": "同类商品屏参考。",
      "kind": "横向分屏效果图"
    }
  ],
  "preheat": [
    {
      "key": "d11-cover-0985",
      "title": "徐杰 · 上场",
      "note": "双十一预热封面。"
    },
    {
      "key": "d11-cover-0986",
      "title": "徐杰 · 出战",
      "note": "双十一预热封面。"
    },
    {
      "key": "d11-cover-0987",
      "title": "徐杰 · 挑战",
      "note": "双十一预热封面。"
    },
    {
      "key": "d11-cover-1026",
      "title": "陈先生卡牌 · 正式启动",
      "note": "双十一预热封面。"
    },
    {
      "key": "d11-cover-1027",
      "title": "陈先生卡牌 · 点将",
      "note": "双十一预热封面。"
    },
    {
      "key": "d11-cover-1028",
      "title": "陈先生卡牌 · 王牌",
      "note": "双十一预热封面。"
    }
  ],
  "proof": [
    {
      "key": "structure",
      "title": "屏体编号",
      "note": "对应中屏、侧翼与楼梯。"
    },
    {
      "key": "mockup",
      "title": "卡牌效果示意",
      "note": "拍摄道具的牌面与背面。"
    },
    {
      "key": "d11-live-1",
      "title": "现场机位 01",
      "note": "场地记录。"
    },
    {
      "key": "d11-live-2",
      "title": "现场机位 02",
      "note": "场地记录。"
    },
    {
      "key": "d11-live-5",
      "title": "现场机位 05",
      "note": "场地记录。"
    },
    {
      "key": "d11-live-8",
      "title": "现场机位 08",
      "note": "场地记录。"
    },
    {
      "key": "d11-live-10",
      "title": "现场机位 10",
      "note": "场地记录。"
    },
    {
      "key": "d11-live-11",
      "title": "现场机位 11",
      "note": "场地记录。"
    },
    {
      "key": "d11-floor-live-1",
      "title": "16 楼商品屏 · 现场 01",
      "note": "现场相机位置可同时看到前景展台与墙面屏。"
    }
  ]
};
