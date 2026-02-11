
import { AppThemeColor, PrayerTheme, Mission, RewardChoice } from './types';

export const TRADITIONAL_PRAYERS_BANK: Record<string, { name: string, firstLine: string, full: string }> = {
  "dau_thanh_gia": {
    name: "Dấu Thánh Giá",
    firstLine: "Nhân danh Cha và Con và Thánh Thần. Amen.",
    full: "Nhân danh Cha và Con và Thánh Thần. Amen."
  },
  "kinh_duc_chua_thanh_than": {
    name: "Kinh Đức Chúa Thánh Thần",
    firstLine: "Chúng con lạy ơn Đức Chúa Thánh Thần...",
    full: "Chúng con lạy ơn Đức Chúa Thánh Thần thiêng liêng sáng láng vô cùng. Chúng con xin Đức Chúa Thánh Thần xuống, đầy lòng chúng con là kẻ tin cậy Đức Chúa Trời, và đốt lửa kính mến Đức Chúa Trời trong lòng chúng con; chúng con xin Đức Chúa Trời cho Đức Chúa Thánh Thần xuống:\n\n- Sửa lại mọi sự trong ngoài chúng con.\n\nChúng con cầu cùng Đức Chúa Trời xưa đã cho Đức Chúa Thánh Thần xuống soi lòng dậy dỗ các Thánh Tông Đồ, thì rầy chúng con cũng xin Đức Chúa Trời cho Đức Chúa Thánh Thần lại xuống, yên ủi dạy dỗ chúng con làm những việc lành, vì công nghiệp vô cùng Đức Chúa GiêsuKitô là Chúa chúng con. Amen."
  },
  "kinh_vi_dau": {
    name: "Kinh Vì Dấu",
    firstLine: "Lạy Chúa chúng con, vì dấu Thánh Giá...",
    full: "Lạy Chúa chúng con, vì dấu Thánh Giá (dấu Thánh gia trên trán), xin chữa chúng con (dấu Thánh gia trên môi), cho khỏi kẻ thù (dấu Thánh gia trên ngực), nhân danh Cha và Con và Thánh Thần. Amen."
  },
  "kinh_tin": {
    name: "Kinh Tin",
    firstLine: "Lạy Chúa con, con tin thật có một Đức Chúa Trời...",
    full: "Lạy Chúa con, con tin thật có một Đức Chúa Trời là Đấng thưởng phạt vô cùng. Con lại tin thật Đức Chúa Trời có Ba Ngôi, mà Ngôi Thứ Hai đã xuống thế làm người chịu nạn chịu chết mà chuộc tội thiên hạ. Bấy nhiêu điều ấy cùng các điều Hội Thánh dậy thì con tin vững vàng vì Chúa là Đấng thông minh and chân thật vô cùng đã phán truyền cho Hội Thánh. Amen."
  },
  "kinh_cay": {
    name: "Kinh Cậy",
    firstLine: "Lạy Chúa con, con trông cậy vững vàng...",
    full: "Lạy Chúa con, con trông cậy vững vàng vì công nghiệp Đức Chúa Giêsu thì Chúa sẽ ban ơn cho con giữ đạo nên ở đời này, cho ngày sau được lên thiên đàng xem thấy mặt Đức Chúa Trời hưởng phúc đời đời, vì Chúa là đấng phép tắc và lòng lành vô cùng đã phán hứa sự ấy chẳng có lẽ nào sai được. Amen."
  },
  "kinh_kinh_men": {
    name: "Kinh Kính Mến",
    firstLine: "Lạy Chúa con, con kính mến Chúa hết lòng...",
    full: "Lạy Chúa con, con kính mến Chúa hết lòng hết sức trên hết mọi sự, vì Chúa là Đấng trọn tốt trọn lành vô cùng, lại vì Chúa thì con thương yêu người ta như mình con vậy. Amen."
  },
  "kinh_lay_cha": {
    name: "Kinh Lạy Cha",
    firstLine: "Lạy Cha chúng con ở trên trời...",
    full: "Lạy Cha chúng con ở trên trời, chúng con nguyện danh Cha cả sáng, nước Cha trị đến, ý Cha thể hiện dưới đất cũng như trên trời.\n\nXin Cha cho chúng con hôm nay lương thực hằng ngày và tha nợ chúng con như chúng con cũng tha kẻ có nợ chúng con. Xin chớ để chúng con sa chước cám dỗ, nhưng cứu chúng con cho khỏi sự dữ. Amen."
  },
  "kinh_kinh_mung": {
    name: "Kinh Kính Mừng",
    firstLine: "Kính mừng Maria đầy ơn phúc...",
    full: "Kính mừng Maria đầy ơn phúc, Đức Chúa Trời ở cùng Bà, Bà có phúc lạ hơn mọi người nữ, và Giêsu con lòng Bà gồm phúc lạ.\n\nThánh Maria Đức Mẹ Chúa Trời, cầu cho chúng con là kẻ có tội khi này và trong giờ lâm tử. Amen."
  },
  "kinh_sang_danh": {
    name: "Kinh Sáng Danh",
    firstLine: "Sáng danh Đức Chúa Cha...",
    full: "Sáng danh Đức Chúa Cha, và Đức Chúa Con và Đức Chúa Thánh Thần.\n\nNhư đã có trước vô cùng và bây giờ và hằng có và đời đời chẳng cùng. Amen."
  },
  "kinh_an_nan_toi": {
    name: "Kinh Ăn Năn Tội",
    firstLine: "Lạy Chúa, Chúa là Đấng trọn tốt trọn lành...",
    full: "Lạy Chúa, Chúa là Đấng trọn tốt trọn lành vô cùng. Chúa đã dựng nên con, và cho Con Chúa ra đời chịu nạn chịu chết vì con, mà con đã cả lòng phản nghịch lỗi nghĩa cùng Chúa, thì con lo buồn đau đớn, cùng chê ghét mọi tội con trên hết mọi sự; con dốc lòng chừa cải, và nhờ ơn Chúa thì con sẽ lánh xa dịp tội cùng làm việc đền tội cho xứng. Amen."
  },
  "kinh_cao_minh": {
    name: "Kinh Cáo Mình",
    firstLine: "Tôi thú nhận cùng Thiên Chúa toàn năng...",
    full: "Tôi thú nhận cùng Thiên Chúa toàn năng và cùng anh chị em. Tôi đã phạm tội nhiều trong tư tưởng, lời nói, việc làm và những điều thiếu sót: lỗi tại tôi, lỗi tại tôi, lỗi tại tôi mọi đàng.\n\nVì vậy tôi xin Đức Bà Maria trọn đời đồng trinh, các thiên thần, các thánh và anh chị em, khẩn cầu cho tôi trước toà Thiên Chúa, Chúa chúng ta."
  },
  "kinh_tin_kinh": {
    name: "Kinh Tin Kính (bản ngắn)",
    firstLine: "Tôi tin kính Đức Chúa Trời là Cha...",
    full: "Tôi tin kính Đức Chúa Trời là Cha phép tắc vô cùng dựng nên trời đất.\n\nTôi tin kính Đức Chúa GiêsuKitô là Con Một Đức Chúa Cha cùng là Chúa chúng tôi; bởi phép Đức Chúa Thánh Thần mà Người xuống thai, sinh bởi Bà Maria đồng trinh: chịu nạn đời quan Phong-xi-ô Phi-la-tô, chịu đóng đanh trên cây Thánh giá, chết và táng xác; xuống ngục tổ tông, ngày thứ ba bởi trong kẻ chết mà sống lại; lên trời ngự bên hữu Đức Chúa Cha phép tắc vô cùng; ngày sau bởi trời lại xuống phán xét kẻ sống và kẻ chết.\n\nTôi tin kính Đức Chúa Thánh Thần. Tôi tin có Hội Thánh hằng có ở khắp thế này, các thánh thông công. Tôi tin phép tha tội. Tôi tin xác loài người ngày sau sống lại. Tôi tin hằng sống vậy. Amen."
  },
  "kinh_sang_soi": {
    name: "Kinh Sáng Soi",
    firstLine: "Cúi xin Chúa sáng soi...",
    full: "Cúi xin Chúa sáng soi, cho chúng con được biết việc phải làm, cùng khi làm, xin Chúa giúp đỡ cho mỗi kinh mỗi việc chúng con, từ khởi sự cho đến hoàn thành, đều nhờ bởi ơn Chúa. Amen."
  },
  "kinh_duc_thanh_thien_than": {
    name: "Kinh Đức Thánh Thiên Thần",
    firstLine: "Con thân Đức Thánh Thiên Thần...",
    full: "Con thân Đức Thánh Thiên Thần, tính thiêng liêng sáng láng, con cám ơn Đức Thánh Thiên Thần giữ con từ thuở mới sinh đến nay cho khỏi tay quỉ. Đức Thánh Thiên Thần là thầy con, mở lòng cho con biết được đạo thánh Chúa Trời đất. Vì vậy con cầu cùng Đức Thánh Thiên Thần giữ con ban ngày, xem con ban đêm, cho đến trọn đời, kẻo ma quỉ dữ cám dỗ được con. Con lạy Đức Thánh Thiên Thần khấn nguyện cho con thông minh sáng láng, giữ mười sự răn, chừa mọi sự dữ, đến khi con lâm chung, xin cùng Đức Chúa Trời cho linh hồn con được lên ở cùng Đức Chúa Trời và Thánh Thiên Thần hằng sống vui vẻ đời đời chẳng cùng. Amen."
  },
  "kinh_lay_nu_vuong": {
    name: "Kinh Lạy Nữ Vương",
    firstLine: "Lạy Nữ Vương Mẹ nhân lành...",
    full: "Lạy Nữ Vương Mẹ nhân lành làm cho chúng con được sống, được vui, được cậy. Thân lạy Mẹ, chúng con, con cháu E-và ở chốn khách đầy, kêu đến cùng Bà; Chúng con ở nơi khóc lóc than thở kêu khấn Bà thương. Hỡi ôi! Bà là Chúa bầu chúng con, xin ghé mắt thương xem chúng con. Đến sau khỏi đày, xin cho chúng con được thấy Đức Chúa Giêsu, Con lòng Bà gồm phúc lạ.\n\nÔi khoan thay! nhân thay! dịu thay! Thánh Maria trọn đời đồng trinh. Amen."
  },
  "kinh_hay_nho": {
    name: "Kinh Hãy Nhớ",
    firstLine: "Lạy Thánh Nữ Đồng Trinh Maria...",
    full: "Lạy Thánh Nữ Đồng Trinh Maria là Mẹ rất nhân từ, xin hãy nhớ xưa nay chưa từng nghe có người nào chạy đến cùng Đức Mẹ xin bầu chữa cứu giúp mà Đức Mẹ từ bỏ chẳng nhậm lời. Nhân vì sự ấy, con hết lòng trông cậy than van chạy đến sấp mình xuống dưới chân Đức Mẹ là Nữ Đồng Trinh trên hết các kẻ đồng trinh, xin Đức Mẹ đoái đến con là kẻ tội lỗi. Lạy Mẹ là Mẹ Chúa Cứu thế, xin chớ bỏ lời con kêu xin, một dủ lòng thương và nhậm lời con cùng. Amen."
  },
  "kinh_cam_on": {
    name: "Kinh Cám Ơn",
    firstLine: "Con cám ơn Đức Chúa Trời...",
    full: "Con cám ơn Đức Chúa Trời là Chúa lòng lành vô cùng chẳng bỏ con, chẳng để con không đời đời, mà lại sinh ra con, cho con được làm người, cùng hằng gìn giữ con, hằng che chở con, lại cho Ngôi Hai xuống thế làm người, chuộc tội chịu chết trên cây Thánh Giá vì con, lại cho con được đạo thánh Đức Chúa Trời, cùng chịu nhiều ơn nhiều phép Hội Thánh nữa, và đã cho phần xác con đêm nay (tối thì đọc: ngày hôm nay) được mọi sự lành; lại cứu lấy con kẻo phải chết tươi ăn năn tội chẳng kịp. Vậy các Thánh ở trên nước thiên đàng cám ơn Đức Chúa Trời thế nào, thì con cũng hợp cùng các Thánh mà dâng cho Chúa con cùng cám ơn như vậy. Amen."
  },
  "kinh_pho_dang": {
    name: "Kinh Phó Dâng",
    firstLine: "Lạy Chúa, con xin phó dâng...",
    full: "Lạy Chúa, con xin phó dâng linh hồn và xác con ở tay Chúa. Chúa đã phù hộ con ban ngày, thì xin Chúa cũng gìn giữ con ban đêm, kẻo sa phạm tội gì mất lòng Chúa hay là chết tươi ăn năn tội chẳng kịp. Chớ gì sống chết con được giữ một lòng kính mến Chúa luôn. Amen."
  },
  "kinh_vuc_sau": {
    name: "Kinh Vực Sâu",
    firstLine: "Lạy Chúa, con ở dưới vực sâu...",
    full: "Lạy Chúa, con ở dưới vực sâu kêu lên Chúa, xin Chúa hãy thương nhậm lời con kêu van, hãy lắng nghe tiếng con cầu xin. Nếu Chúa chấp tội, nào ai rỗi được? Bởi Chúa hằng có lòng lành, cùng vì lời Chúa phán hứa, con đã trông cậy Chúa. Linh hồn con cậy vì lời hứa ấy thì đã trông cậy Chúa. Những kẻ làm dân Đức Chúa Trời, đêm ngày hãy trông cậy Người cho liên, vì Người rất nhân lành hay thương vô cùng, sẽ tha hết mọi tội lỗi kẻ làm dân Người thay thảy.\n\nLạy Chúa, xin ban cho các linh hồn được nghỉ ngơi đời đời, và được sáng soi vô cùng. Lạy Chúa, xin cứu lấy các linh hồn cho khỏi tù ngục mà được nghỉ yên. Amen.\n\nLạy ơn Đức Chúa Giêsu, Chúa đã phán dạy rằng, con hãy xin thì con sẽ được. Vậy con xin Chúa lòng lành vô cùng thương đến các linh hồn nơi luyện tội. Xin Chúa nghe lời con cầu xin kêu van, cho linh hồn ông bà, cha mẹ, anh em, bạn hữu con. Xin Chúa mở cửa thiên đàng cho các linh hồn ấy vào. Xin cho các linh hồn ấy được sự sống vô cùng hằng soi cho liên. Amen."
  },
  "kinh_trong_cay": {
    name: "Kinh Trông Cậy",
    firstLine: "Chúng con trông cậy rất thánh Đức Mẹ...",
    full: "Chúng con trông cậy rất thánh Đức Mẹ Chúa Trời, xin chớ chê chớ bỏ lời chúng con nguyện trong cơn gian nan thiếu thốn, Đức Nữ đồng trinh, hiển vinh sáng láng.\n\n- Hằng chữa chúng con cho khỏi mọi sự dữ. Amen."
  },
  "cac_cau_lay": {
    name: "Các Câu Lạy",
    firstLine: "Lạy rất thánh trái tim Đức Chúa Giêsu...",
    full: "Lạy rất thánh trái tim Đức Chúa Giêsu,\n- Thương xót chúng con.\n\nLạy trái tim cực thanh cực tịnh rất thánh Đức Bà Maria,\n- Cầu cho chúng con.\n\nLạy ông thánh Giuse là bạn thanh sạch Đức Bà Maria trọn đời đồng trinh,\n- Cầu cho chúng con.\n\nCác Thánh Tử Vì Đạo Nước Việt Nam,\n- Cầu cho chúng con.\n\nNữ Vương ban sự bằng an,\n- Cầu cho chúng con."
  }
};

export const CROSS_LEVELS = [
  { level: 1, name: 'Hạt Giống Đơn Sơ', minExp: 0, minGrace: 0, icon: '🌱' },
  { level: 2, name: 'Vững Bước Theo Thầy', minExp: 150, minGrace: 150, icon: '👣' },
  { level: 3, name: 'Trái Tim Bác Ái', minExp: 400, minGrace: 400, icon: '❤️' },
  { level: 4, name: 'Ngọn Đuốc Chứng Nhân', minExp: 800, minGrace: 800, icon: '🕯️' },
  { level: 5, name: 'Ánh Sáng Trường Cửu', minExp: 1500, minGrace: 1500, icon: '👑' },
];

export const LEVEL_REWARDS_POOL: Record<number, RewardChoice[]> = {
  2: [
    { id: 'reward_blue', type: 'theme', name: 'Đại Dương Xanh', description: 'Giao diện xanh hy vọng, bình yên như lòng biển.', value: 'blue', icon: 'fa-droplet' },
    { id: 'reward_emerald', type: 'theme', name: 'Rừng Xanh Sự Sống', description: 'Giao diện xanh lá, tươi mát như vườn Eden.', value: 'emerald', icon: 'fa-leaf' },
    { id: 'reward_intent_morn', type: 'intention', name: 'Gói Bình Minh', description: 'Gợi ý ý nguyện dâng ngày mới sâu sắc.', value: 'Sức mạnh ngày mới, Ơn trung tín, Niềm vui phục vụ', icon: 'fa-sun' }
  ],
  3: [
    { id: 'reward_rose', type: 'theme', name: 'Hoa Hồng Bác Ái', description: 'Giao diện hồng dịu dàng, đầy lòng mến Chúa.', value: 'rose', icon: 'fa-heart' },
    { id: 'reward_purple', type: 'theme', name: 'Tím Sám Hối', description: 'Giao diện tím huyền bí, giúp con tĩnh tâm hơn.', value: 'purple', icon: 'fa-moon' },
    { id: 'reward_intent_gratitude', type: 'intention', name: 'Mạch Sống Tri Ân', description: 'Mở khóa những lời tạ ơn đầy chân thành.', value: 'Ơn tri ân Chúa, Tạ ơn vì sự sống, Biết ơn gia đình', icon: 'fa-hands-holding' }
  ],
  4: [
    { id: 'reward_slate', type: 'theme', name: 'Thạch Bản Kiên Vững', description: 'Giao diện xám trung tính, vững chắc như đức tin.', value: 'slate', icon: 'fa-mountain' },
    { id: 'reward_aura_glow', type: 'aura', name: 'Hào Quang Thánh Khiết', description: 'Hiệu ứng ánh sáng rạng ngời cho hồ sơ của con.', value: 'divine-glow-aura', icon: 'fa-wand-magic-sparkles' },
    { id: 'reward_special_icons', type: 'icon', name: 'Biểu Tượng Thánh Linh', description: 'Mở khóa Chim bồ câu và Ngọn lửa mến.', value: 'fa-dove, fa-fire-flame-curved', icon: 'fa-dove' }
  ],
  5: [
    { id: 'reward_gold', type: 'theme', name: 'Hào Quang Thiên Quốc', description: 'Giao diện vàng kim sang trọng nhất.', value: 'gold', icon: 'fa-crown' },
    { id: 'reward_crimson', type: 'theme', name: 'Đỏ Nhiệt Thành', description: 'Giao diện đỏ rực rỡ như máu các Thánh tử đạo.', value: 'crimson', icon: 'fa-fire' },
    { id: 'reward_intent_master', type: 'intention', name: 'Sâu Thẳm Đức Tin', description: 'Mở khóa các ý nguyện hiến dâng cao cả nhất.', value: 'Hiệp thông Giáo Hội, Cầu cho linh hồn, Ơn phân định ơn gọi', icon: 'fa-scroll' }
  ]
};

export const DAILY_MISSION_TEMPLATES = [
  { title: 'Kinh Sáng', description: 'Dâng ngày mới cho Chúa ngay khi thức dậy.', expReward: 15, icon: 'fa-sun' },
  { title: 'Lời Chúa', description: 'Đọc và suy ngẫm ít nhất 1 câu Kinh Thánh.', expReward: 20, icon: 'fa-bible' },
  { title: 'Việc Thiện', description: 'Nếu bạn chưa biết làm việc thiện gì hôm nay, hãy âm thầm đóng góp cho quỹ Caritas giáo phận để nâng đỡ những hoàn cảnh khó khăn hơn.', expReward: 25, icon: 'fa-heart' },
  { title: 'Kinh Tối', description: 'Tạ ơn Chúa trước khi khép lại một ngày.', expReward: 15, icon: 'fa-moon' },
  { title: 'Xét Mình', description: 'Dành 2 phút nhìn lại tâm hồn mình.', expReward: 20, icon: 'fa-magnifying-glass' },
];

export const WEEKLY_MISSION_TEMPLATES = [
  { title: 'Thánh Lễ', description: 'Tham dự ít nhất một Thánh lễ trong tuần.', expReward: 100, graceReward: 100, icon: 'fa-church' },
  { title: 'Bí Tích Hòa Giải', description: 'Làm sạch tâm hồn qua Bí tích Giải tội.', expReward: 150, graceReward: 150, icon: 'fa-hands-asl-interpreting' },
  { title: 'Bác Ái', description: 'Giúp đỡ một người nghèo hoặc người gặp khó khăn.', expReward: 120, graceReward: 120, icon: 'fa-hand-holding-heart' },
  { title: 'Học Giáo Lý', description: 'Dành thời gian tìm hiểu thêm về đức tin.', expReward: 80, graceReward: 80, icon: 'fa-book-open' },
  { title: 'Chầu Thánh Thể', description: 'Dành ít nhất 30 phút chầu Thánh Thể để lắng nghe Chúa.', expReward: 130, graceReward: 130, icon: 'fa-bread-slice' },
  { title: 'Đọc Kinh Thánh', description: 'Đọc và suy niệm một đoạn Kinh Thánh dài hơn mỗi ngày trong tuần.', expReward: 90, graceReward: 90, icon: 'fa-book-bible' },
  { title: 'Cầu Nguyện Gia Đình', description: 'Tổ chức một buổi cầu nguyện chung với gia đình hoặc bạn bè.', expReward: 110, graceReward: 110, icon: 'fa-people-group' },
  { title: 'Thăm Viếng Người Bệnh', description: 'Thăm hỏi và cầu nguyện cho một người đang ốm đau hoặc già yếu.', expReward: 140, graceReward: 140, icon: 'fa-hospital' },
  { title: 'Tham Gia Sinh Hoạt Giáo Xứ', description: 'Tham gia một hoạt động của giáo xứ như hội đoàn, ca đoàn, hoặc nhóm thiện nguyện.', expReward: 100, graceReward: 100, icon: 'fa-users' },
  { title: 'Làm Việc Bác Ái Cụ Thể', description: 'Thực hiện một việc bác ái cụ thể như quyên góp, tình nguyện, hoặc giúp đỡ người cần.', expReward: 125, graceReward: 125, icon: 'fa-hands-helping' },
  { title: 'Học Về Các Thánh', description: 'Tìm hiểu về cuộc đời và gương sáng của một vị thánh trong tuần.', expReward: 85, graceReward: 85, icon: 'fa-user-ninja' },
  { title: 'Chia Sẻ Đức Tin', description: 'Chia sẻ về đức tin với một người bạn hoặc người thân trong tuần.', expReward: 115, graceReward: 115, icon: 'fa-comments' },
  { title: 'Cầu Nguyện Cho Giáo Hội', description: 'Dành thời gian cầu nguyện đặc biệt cho Đức Giáo Hoàng và Giáo Hội toàn cầu.', expReward: 95, graceReward: 95, icon: 'fa-globe' },
  { title: 'Suy Niệm Lời Chúa Hàng Ngày', description: 'Duy trì thói quen đọc và suy niệm Lời Chúa mỗi ngày trong tuần.', expReward: 105, graceReward: 105, icon: 'fa-lightbulb' },
];

export const THEME_COLORS: Record<AppThemeColor, { primary: string; secondary: string; text: string; bg: string; accent: string }> = {
  emerald: { primary: 'bg-emerald-600', secondary: 'bg-emerald-50', text: 'text-emerald-900', bg: 'bg-[#f8faf9]', accent: 'emerald' },
  amber: { primary: 'bg-amber-700', secondary: 'bg-amber-50', text: 'text-amber-900', bg: 'bg-[#fdfcfb]', accent: 'amber' },
  blue: { primary: 'bg-blue-600', secondary: 'bg-blue-50', text: 'text-blue-900', bg: 'bg-[#f8f9fa]', accent: 'blue' },
  rose: { primary: 'bg-rose-600', secondary: 'bg-rose-50', text: 'text-rose-900', bg: 'bg-[#faf8f9]', accent: 'rose' },
  slate: { primary: 'bg-slate-800', secondary: 'bg-slate-50', text: 'text-slate-900', bg: 'bg-[#000000]', accent: 'slate' },
  gold: { primary: 'bg-yellow-600', secondary: 'bg-yellow-50', text: 'text-yellow-900', bg: 'bg-[#fffdf5]', accent: 'gold' },
  purple: { primary: 'bg-purple-600', secondary: 'bg-purple-50', text: 'text-purple-900', bg: 'bg-[#f9f8ff]', accent: 'purple' },
  crimson: { primary: 'bg-rose-800', secondary: 'bg-rose-50', text: 'text-rose-950', bg: 'bg-[#fffaf9]', accent: 'crimson' },
};

export const GRACE_PER_PRAYER = 10; // Ơn Chúa mỗi lần cầu nguyện
export const FALLBACK_PRAYER = "Lạy Chúa, xin dẫn lối con trong ngày hôm nay. Amen.";
export const DEFAULT_REMINDERS = [
  { id: '1', time: '06:30', theme: PrayerTheme.DAILY, active: true },
  { id: '2', time: '21:30', theme: PrayerTheme.SLEEP, active: true },
];

export const DASHBOARD_THEMES = [
  PrayerTheme.DAILY,
  PrayerTheme.SLEEP,
  PrayerTheme.TRAVEL,
  PrayerTheme.EXAM,
];
