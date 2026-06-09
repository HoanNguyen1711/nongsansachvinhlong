from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy import text
from app.core.config import settings

# check_same_thread is needed only for SQLite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

def init_db():
    import os
    from alembic.config import Config
    from alembic import command
    from app.models.user import User
    from app.models.product import Product
    from app.models.blog import Blog
    from app.models.category import Category
    from app.models.setting import Setting
    from app.models.testimonial import Testimonial
    
    # Path to alembic.ini relative to this file
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    alembic_ini_path = os.path.join(base_dir, "alembic.ini")
    
    # Run Alembic migrations programmatically
    alembic_cfg = Config(alembic_ini_path)
    command.upgrade(alembic_cfg, "head")
    
    # Initialize default admin if not exists
    with Session(engine) as session:
        from sqlmodel import select
        from app.core.security import get_password_hash
        
        statement = select(User).where(User.username == settings.ADMIN_USERNAME)
        admin = session.exec(statement).first()
        if not admin:
            hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
            new_admin = User(
                username=settings.ADMIN_USERNAME,
                hashed_password=hashed_password,
                is_active=True,
                is_superuser=True
            )
            session.add(new_admin)
            session.commit()
        else:
            if not admin.is_superuser:
                admin.is_superuser = True
                session.add(admin)
                session.commit()

        # Seed default categories if database has no categories
        statement_c = select(Category)
        existing_categories = session.exec(statement_c).all()
        if not existing_categories:
            mock_categories = [
                Category(name="Trái cây tươi", name_en="Fresh fruits", name_zh="新鲜水果", slug="trai-cay-tuoi"),
                Category(name="Rau củ & Gia vị", name_en="Vegetables & Spices", name_zh="蔬菜与香料", slug="rau-cu-va-gia-vi"),
                Category(name="Nông sản chế biến & Đông lạnh", name_en="Processed & Frozen Products", name_zh="加工与冷冻农产品", slug="nong-san-che-bien-va-dong-lanh")
            ]
            for c in mock_categories:
                session.add(c)
            session.commit()

        # Seed default settings if they don't exist
        default_settings = {
            "phone_number": "0901234567",
            "address": "123 Đường Phan Chu Trinh, TP. Buôn Ma Thuột, Đắk Lắk",
            "email": "contact@nongsansach.vn",
            "farm_image_url": "",
            "zalo_qr_url": "",
            "banner_image_url_1": "",
            "banner_image_url_2": "",
            "banner_image_url_3": "",
            "homepage_layout": "default",
        }
        for key, value in default_settings.items():
            db_setting = session.exec(select(Setting).where(Setting.key == key)).first()
            if not db_setting:
                session.add(Setting(key=key, value=value))
        session.commit()

        # Seed default products if database has no products
        statement_p = select(Product)
        existing_products = session.exec(statement_p).all()
        if not existing_products:
            mock_products = [
                Product(
                    name="Thanh Long Ruột Đỏ Đắk Lắk",
                    name_en="Dak Lak Red Dragon Fruit",
                    name_zh="得乐省红心火龙果",
                    slug="thanh-long-ruot-do-dak-lak",
                    price=35000.0,
                    original_price=45000.0,
                    category="Trái cây tươi",
                    description="Thanh long ruột đỏ Đắk Lắk ngọt thanh, nhiều nước, thịt quả chắc giòn. Đạt tiêu chuẩn an toàn VietGAP, giàu chất xơ và chất chống oxy hóa.",
                    description_en="Dak Lak red dragon fruit is sweet, juicy, and has firm flesh. Grown under VietGAP safety standards, rich in fiber and antioxidants.",
                    description_zh="得乐省红心火龙果，清甜多汁，果肉紧实。符合VietGAP安全标准，富含膳食纤维和抗氧化剂。",
                    is_available=True
                ),
                Product(
                    name="Xoài Cát Hòa Lộc Chín Cây",
                    name_en="Tree-Ripened Hoa Loc Mangoes",
                    name_zh="树上熟和禄沙芒果",
                    slug="xoai-cat-hoa-loc-chin-cay",
                    price=85000.0,
                    original_price=None,
                    category="Trái cây tươi",
                    description="Xoài cát Hòa Lộc nổi tiếng ngọt đậm đà, cùi dày ít xơ và thơm nồng. Được thu hoạch chín cây tự nhiên trên cành, không dùng hóa chất thúc chín.",
                    description_en="Hoa Loc mangoes are famous for their intense sweetness, thick flesh with minimal fiber, and rich aroma. Naturally harvested fully ripe on the tree, without any chemical ripening agents.",
                    description_zh="和禄沙芒果以其浓郁的甜度、丰厚的果肉（少丝）和馥郁的香气而闻名。树上自然熟透后采摘，不使用any化学催熟剂。",
                    is_available=True
                ),
                Product(
                    name="Nhãn Xuồng Cơm Vàng",
                    name_en="Golden Flesh Longan",
                    name_zh="金肉龙眼",
                    slug="nhan-xuong-com-vang",
                    price=60000.0,
                    original_price=75000.0,
                    category="Trái cây tươi",
                    description="Nhãn xuồng cơm vàng đặc sản Vũng Tàu, quả to, cơm nhãn dày màu vàng nhạt, giòn ngọt thanh khiết. Trái chín tự nhiên trên cây, giữ nguyên hương vị tự nhiên đặc trưng.",
                    description_en="Golden flesh longan has large fruit, thick pale-yellow flesh, crunchy and pure sweet taste. Naturally ripened on the tree to preserve its unique flavor.",
                    description_zh="金肉龙眼，果大，肉厚呈淡黄色，口感酥脆清甜。在树上自然熟透，保留独特的天然风味。",
                    is_available=True
                ),
                Product(
                    name="Vải Thiều Lục Ngạn Hữu Cơ",
                    name_en="Organic Luc Ngan Lychee",
                    name_zh="陆岸有机荔枝",
                    slug="vai-thieu-luc-ngan-huu-co",
                    price=50000.0,
                    original_price=65000.0,
                    category="Trái cây tươi",
                    description="Vải thiều Lục Ngạn chính hiệu, quả to đều, vỏ đỏ đẹp, cùi dày mọng nước, hạt nhỏ và ngọt lịm. Canh tác an toàn sinh học, không dư lượng thuốc bảo vệ thực vật.",
                    description_en="Authentic Luc Ngan lychee, large and uniform fruits, red skin, thick and juicy flesh, small seeds, and honey-like sweetness. Cultivated with biosecurity, no pesticide residues.",
                    description_zh="正宗陆岸荔枝，果大均匀，皮红美观，肉厚多汁，核小甜如蜜。采用生物安全种植，无农药残留。",
                    is_available=True
                ),
                Product(
                    name="Chuối Laba Lâm Đồng",
                    name_en="Lam Dong Laba Banana",
                    name_zh="林同拉巴香蕉",
                    slug="chuoi-laba-lam-dong",
                    price=25000.0,
                    original_price=30000.0,
                    category="Trái cây tươi",
                    description="Chuối Laba Lâm Đồng nổi tiếng dẻo thơm, vị ngọt đậm đà đặc trưng. Chuối chín tự nhiên, không ngâm hóa chất, giàu kali và vitamin tốt cho sức khỏe.",
                    description_en="Lam Dong Laba banana is famous for its chewy texture, unique rich sweetness. Naturally ripened, no chemical soaking, rich in potassium and healthy vitamins.",
                    description_zh="林同拉巴香蕉，以其软糯芳香、独特的浓ự甜度而闻名。自然熟透，不浸泡化学药剂，富含钾和有益健康的维生素。",
                    is_available=True
                ),
                Product(
                    name="Dưa Hấu Không Hạt Long An",
                    name_en="Long An Seedless Watermelon",
                    name_zh="隆安无籽西瓜",
                    slug="dua-hau-khong-hat-long-an",
                    price=22000.0,
                    original_price=28000.0,
                    category="Trái cây tươi",
                    description="Dưa hấu không hạt ngọt lịm, đỏ mọng nước, vỏ mỏng bền. Đạt tiêu chuẩn VietGAP, là thức quả giải nhiệt lý tưởng cho những ngày hè nắng nóng.",
                    description_en="Seedless watermelon is sweet, deep red, juicy, and has thin skin. Complies with VietGAP standards, making it the ideal refreshing fruit for hot summer days.",
                    description_zh="无籽西瓜，甜度高，红润多汁，皮薄。符合VietGAP标准，是炎热夏日理想的消暑水果。",
                    is_available=True
                ),
                Product(
                    name="Chôm Chôm Nhãn Bến Tre",
                    name_en="Ben Tre Rambutan",
                    name_zh="槟知红毛丹",
                    slug="chom-chom-nhan-ben-tre",
                    price=45000.0,
                    original_price=55000.0,
                    category="Trái cây tươi",
                    description="Chôm chôm nhãn đặc sản Bến Tre tróc hạt, cùi giòn, vị ngọt thanh mát đặc trưng. Trái hái trong ngày tại vườn, giữ nguyên độ tươi mới.",
                    description_en="Ben Tre rambutan is easy to peel, crunchy, and has a refreshing sweet taste. Harvested daily from the orchard to ensure maximum freshness.",
                    description_zh="槟知特产红毛丹，易剥壳，肉质酥脆，具有独特的清甜口感。当天从果园采摘，保持原汁原味的新鲜度。",
                    is_available=True
                ),
                Product(
                    name="Mít Thái Viên Linh Đắk Lắk",
                    name_en="Dak Lak Thai Jackfruit",
                    name_zh="得乐省泰国菠萝蜜",
                    slug="mit-thai-vien-linh-dak-lak",
                    price=38000.0,
                    original_price=48000.0,
                    category="Trái cây tươi",
                    description="Mít Thái cơm vàng rơm, múi dày, giòn và ngọt lịm. Đậm đà hương vị núi rừng Tây Nguyên, đóng khay sạch sẽ hoặc nguyên quả tiện lợi.",
                    description_en="Thai jackfruit with straw-yellow flesh, thick, crunchy and sweet segments. Full of Central Highlands flavor, available in clean pre-packaged trays or whole fruit.",
                    description_zh="泰国菠萝蜜，果肉呈金黄色，肉厚、酥脆且甜美。充满西原山林风味，提供干净的盒装或整只购买。",
                    is_available=True
                ),
                Product(
                    name="Măng Cụt Lái Thiêu Loại 1",
                    name_en="Lai Thieu Mangosteen (Grade 1)",
                    name_zh="莱眺特级山竹 (1级)",
                    slug="mang-cut-lai-thieu-loai-1",
                    price=95000.0,
                    original_price=120000.0,
                    category="Trái cây tươi",
                    description="Măng cụt Lái Thiêu vỏ mỏng, múi trắng muốt, vị chua ngọt hài hòa tinh tế. Được thu hoạch thủ công cẩn thận, không làm dập quả.",
                    description_en="Lai Thieu mangosteen with thin skin, snow-white segments, and a delicate sweet-and-sour flavor. Carefully hand-harvested to prevent bruising.",
                    description_zh="莱眺山竹，皮薄，果肉雪白，酸甜适口，口感细腻。手工精心采收，避免果实受损。",
                    is_available=True
                ),
                Product(
                    name="Thạch Đen Tràng Định Lạng Sơn",
                    name_en="Lang Son Grass Jelly",
                    name_zh="谅山省石门黑凉粉",
                    slug="thach-den-trang-dinh-lang-son",
                    price=30000.0,
                    original_price=35000.0,
                    category="Nông sản chế biến & Đông lạnh",
                    description="Thạch đen được chế biến từ cây sương sáo tự nhiên của vùng Tràng Định, Lạng Sơn. Thạch giòn dai, thanh mát, là món ăn giải nhiệt tuyệt hảo.",
                    description_en="Grass jelly processed from natural mesona plants in Trang Dinh, Lang Son. Chewy, crunchy and cooling, it is an excellent dessert to beat the heat.",
                    description_zh="谅山省石门黑凉粉，采用当地天然仙草（凉粉草）制成。口感Q弹清爽，是极佳的消暑甜品。",
                    is_available=True
                ),
                Product(
                    name="Sầu Riêng Ri6 Đắk Lắk",
                    name_en="Dak Lak Ri6 Durian",
                    name_zh="得乐省Ri6榴莲",
                    slug="sau-rieng-ri6-dak-lak",
                    price=150000.0,
                    original_price=180000.0,
                    category="Trái cây tươi",
                    description="Sầu riêng Ri6 cơm vàng hạt lép, thơm ngon béo ngậy, ngọt đậm đà. Hái già chín tự nhiên, không nhúng thuốc, cơm sầu riêng dày mịn không sượng bột.",
                    description_en="Ri6 durian with thick yellow flesh, small seeds, rich aroma, and deep sweetness. Harvested at peak maturity, chemical-free, smooth and creamy texture.",
                    description_zh="得乐省Ri6榴莲，果肉金黄，核小，香气浓郁，甜度高。成熟度佳时采摘，无化学处理，果肉厚实细腻。",
                    is_available=True
                ),
                Product(
                    name="Chanh Dây Tươi Đắk Lắk",
                    name_en="Fresh Dak Lak Passion Fruit",
                    name_zh="得乐省新鲜百香果",
                    slug="chanh-day-tuoi-dak-lak",
                    price=30000.0,
                    original_price=40000.0,
                    category="Trái cây tươi",
                    description="Chanh dây tươi quả mọng, nhiều dịch, vị chua thanh thơm ngát đặc trưng. Giàu vitamin C, lý tưởng để pha chế nước uống giải nhiệt hoặc làm nước sốt.",
                    description_en="Fresh passion fruit, juicy pulp with a characteristic refreshing tartness and rich aroma. Rich in vitamin C, perfect for drinks or culinary sauces.",
                    description_zh="得乐省新鲜百香果，果实饱满，汁多，具有独特的清酸香气。富含维生素C，非常适合调制消暑饮品或制作酱汁。",
                    is_available=True
                ),
                Product(
                    name="Khoai Lang Mật Đắk Lắk",
                    name_en="Dak Lak Sweet Honey Potatoes",
                    name_zh="得乐省蜜汁红薯",
                    slug="khoai-lang-mat-dak-lak",
                    price=25000.0,
                    original_price=35000.0,
                    category="Rau củ & Gia vị",
                    description="Khoai lang mật Đắk Lắk được trồng trên vùng đất bazan màu mỡ. Khi nướng hoặc luộc, khoai chảy mật ngọt lịm, dẻo thơm, giàu chất xơ tốt cho tiêu hóa.",
                    description_en="Dak Lak sweet honey potatoes grown in fertile basalt soil. When roasted or boiled, they release a sweet, honey-like syrup, soft texture, rich in dietary fiber.",
                    description_zh="得乐省蜜汁红薯，种植于肥沃的红土高原。烤或煮时会流出如蜜般的糖汁，软糯香甜，富含膳食纤维，有益消化。",
                    is_available=True
                ),
                Product(
                    name="Dừa Xiêm Xanh Bến Tre",
                    name_en="Ben Tre Fresh Green Coconut",
                    name_zh="槟知新鲜青椰",
                    slug="dua-xiem-xanh-ben-tre",
                    price=18000.0,
                    original_price=22000.0,
                    category="Trái cây tươi",
                    description="Dừa xiêm xanh đặc sản Bến Tre gọt trọc tiện lợi. Nước dừa ngọt thanh mát tự nhiên, cơm dừa non dẻo mềm, chứa nhiều khoáng chất bù nước hiệu quả.",
                    description_en="Ben Tre green coconut, conveniently shaved. The coconut water is naturally sweet and refreshing, with soft tender flesh, rich in hydrating minerals.",
                    description_zh="槟知新鲜青椰，去皮便于饮用。椰子水清甜消暑，椰肉鲜嫩软糯，富含矿物质，能有效补充身体水分。",
                    is_available=True
                ),
                Product(
                    name="Ớt Chỉ Thiên Cay Nồng",
                    name_en="Spicy Bird's Eye Chili",
                    name_zh="辛辣朝天椒",
                    slug="ot-chi-thien-cay-nong",
                    price=20000.0,
                    original_price=25000.0,
                    category="Rau củ & Gia vị",
                    description="Ớt chỉ thiên được thu hoạch chín đỏ tươi tại vườn, vị cay nồng đặc trưng, quả giòn ráo nước. Gia vị không thể thiếu trong mỗi bữa ăn gia đình Việt.",
                    description_en="Bird's eye chili harvested ripe and bright red from the garden, featuring a characteristic intense heat and crunchy texture. A must-have spice in Vietnamese meals.",
                    description_zh="新鲜采收的红色朝天椒，辣度十足，果实清脆。是越南家庭餐桌上不可或缺的辛辣调味品。",
                    is_available=True
                ),
                Product(
                    name="Sầu Riêng Ri6 Cấp Đông Xuất Khẩu",
                    name_en="Export-Quality Frozen Ri6 Durian",
                    name_zh="出口级冷冻Ri6榴莲",
                    slug="sau-rieng-ri6-cap-dong-xuat-khau",
                    price=180000.0,
                    original_price=220000.0,
                    category="Nông sản chế biến & Đông lạnh",
                    description="Sầu riêng Ri6 được bóc múi chọn lọc từ những quả chín cây tự nhiên, cấp đông nhanh siêu tốc để giữ trọn vẹn hương vị béo ngậy và dinh dưỡng.",
                    description_en="Ri6 durian flesh selected from tree-ripened fruits, quick-frozen immediately to preserve all of its rich flavor and nutritional value.",
                    description_zh="精选树上熟的Ri6榴莲果肉，采用超快速冷冻技术，完美锁住其浓郁的奶香与营养成分。",
                    is_available=True
                )
            ]
            for p in mock_products:
                session.add(p)
            session.commit()

        # Seed default blogs if database has no blogs
        statement_b = select(Blog)
        existing_blogs = session.exec(statement_b).all()
        if not existing_blogs:
            mock_blogs = [
                Blog(
                    title="Cách Chọn Bơ Sáp Đắk Lắk Dẻo Béo, Không Sượng Bột",
                    title_en="How to Choose Rich, Buttery Dak Lak Avocados Without Bitterness",
                    title_zh="如何挑选软糯浓郁且不发苦的得乐省牛油果",
                    slug="cach-chon-bo-sap-dak-lak-deo-beo-khong-suong-bot",
                    summary="Bơ sáp là loại trái cây bổ dưỡng nhưng rất dễ mua nhầm quả sượng, đắng. Khám phá 5 bí quyết vàng từ nhà nông Đắk Lắk giúp bạn luôn lựa chọn được quả bơ ngon nhất.",
                    summary_en="Avocado is a highly nutritious fruit but it is easy to accidentally buy watery or bitter ones. Explore 5 golden tips from Dak Lak farmers to help you always select the best avocado.",
                    summary_zh="牛油果营养丰富，但很容易买 to water-filled 或发苦的果实。探索得乐省果农分享 of 5个黄金秘诀，帮助您挑选出最完美的牛油果。",
                    content="Bơ sáp là loại trái cây bổ dưỡng nhưng rất dễ mua nhầm quả sượng, đắng. Khám phá 5 bí quyết vàng từ nhà nông Đắk Lắk giúp bạn luôn lựa chọn được quả bơ ngon nhất. Hướng dẫn chi tiết cách chọn quả bơ có vỏ căng bóng nhưng hơi sần sùi, cuống bơ hơi khô và cơm bơ vàng dẻo quánh béo ngậy.",
                    content_en="Avocado is a highly nutritious fruit but it is easy to accidentally buy watery or bitter ones. Explore 5 golden tips from Dak Lak farmers to help you always select the best avocado. Detailed guide on selecting avocados with glossy but slightly rough skin, dry stem pocket, and rich yellow, buttery flesh.",
                    content_zh="牛油果营养丰富，但很容易买到水汪汪 or 发苦 of 果实。探索得乐省果农分享的5个黄金秘诀，帮助您挑选出最完美的牛油果。详细介绍如何根据表皮微粗糙、果蒂干燥以及果肉金黄软糯等特征来进行挑选。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Quy Trình Canh Tác Mắc Ca Đạt Chuẩn VietGAP Tại Vườn",
                    title_en="VietGAP Standard Macadamia Cultivation Process in the Orchard",
                    title_zh="果园中符合VietGAP标准的夏威夷果种植流程",
                    slug="quy-trinh-canh-tac-mac-ca-dat-chuan-vietgap-tai-vuon",
                    summary="Đằng sau những hạt mắc ca giòn bùi, giàu dinh dưỡng là cả một quy trình chăm bón nghiêm ngặt từ bón phân hữu cơ đến kỹ thuật thu hoạch và sấy gió tự nhiên bảo đảm an toàn vệ sinh.",
                    summary_en="Behind the crunchy, rich, and nutrient-dense macadamia nuts is a strict cultivation process, from applying organic fertilizers to natural wind-drying and harvesting techniques ensuring food safety.",
                    summary_zh="香脆、营养丰富的夏威夷果背后，是一套严格的种植 và 加工流程：从施用有机肥， to 自然风干以及确保食品安全的采收技术。",
                    content="Đằng sau những hạt mắc ca giòn bùi, giàu dinh dưỡng là cả một quy trình chăm bón nghiêm ngặt từ bón phân hữu cơ đến kỹ thuật thu hoạch và sấy gió tự nhiên bảo đảm an toàn vệ sinh. Quy trình bao gồm việc giám sát chất lượng đất, nước tưới tiêu và thu hoạch khi quả đạt độ chín chuẩn nhất.",
                    content_en="Behind the crunchy, rich, and nutrient-dense macadamia nuts is a strict cultivation process, from applying organic fertilizers to natural wind-drying and harvesting techniques ensuring food safety. The process includes monitoring soil quality, irrigation water, and harvesting only when the nuts reach optimal maturity.",
                    content_zh="香脆、营养丰富的夏威夷果背后，是一套严格 của 种植 và 加工流程：从施用有机肥，到自然风干以及确保食品安全的采收技术。该流程包括对土壤质量、灌溉水源的严格监控，并仅在坚果达到最佳成熟度时进行采收。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Lợi Ích Sức Khỏe Tuyệt Vời Của Hạt Mắc Ca Sấy Gió",
                    title_en="Amazing Health Benefits of Wind-Dried Macadamia Nuts",
                    title_zh="风干夏威夷果令人惊叹的的健康益处",
                    slug="loi-ich-suc-khoe-tuyet-voi-cua-hat-mac-ca-say-gio",
                    summary="Mắc ca được mệnh danh là nữ hoàng các loại quả khô. Cùng Nông Sản Sạch tìm hiểu những lợi ích bất ngờ đối với tim mạch, não bộ và làm đẹp da khi ăn mắc ca mỗi ngày.",
                    summary_en="Macadamia is crowned as the queen of dried fruits. Discover the unexpected benefits for heart health, brain function, and skin beauty when eating macadamia nuts daily with Nong San Sach.",
                    summary_zh="夏威夷果被誉为干果皇后。与“Nông Sản Sạch”一起探索每天食用夏威夷果对心脏健康、大脑功能 và 美容护肤 do-right 带来的惊喜益处。",
                    content="Mắc ca được mệnh danh là nữ hoàng các loại quả khô. Cùng Nông Sản Sạch tìm hiểu những lợi ích bất ngờ đối với tim mạch, não bộ và làm đẹp da khi ăn mắc ca mỗi ngày. Hạt mắc ca chứa nhiều axit béo không bão hòa đơn tốt cho tim mạch, hỗ trợ giảm cholesterol xấu và cung cấp năng lượng dồi dào.",
                    content_en="Macadamia is crowned as the queen of dried fruits. Discover the unexpected benefits for heart health, brain function, and skin beauty when eating macadamia nuts daily with Nong San Sach. Macadamia nuts contain high amounts of monounsaturated fatty acids which are good for the heart, support lower bad cholesterol, and provide rich energy.",
                    content_zh="夏威夷果被誉为干果皇后。与“Nông Sản Sạch”一起探索每天食用夏威夷果对心脏健康、大脑功能和美容护肤 do-right 带来的惊喜益处。夏威夷果富含对心脏有益 of 单不饱和脂肪酸，有助于降低坏胆固醇，并提供充足의 năng lượng.",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Lợi ích sức khỏe vượt trội của Sầu Riêng Ri6 bạn cần biết",
                    title_en="Outstanding Health Benefits of Ri6 Durian You Need to Know",
                    title_zh="您需要了解的Ri6榴莲的杰出健康益处",
                    slug="loi-ich-suc-khoe-vuot-troi-cua-sau-rieng-ri6-ban-can-biet",
                    summary="Sầu riêng không chỉ là vua của các loại trái cây về hương vị mà còn là nguồn cung cấp dồi dào chất xơ, vitamin C, kali và chất chống oxy hóa có lợi cho sức khỏe.",
                    summary_en="Durian is not only the king of fruits in flavor but also a rich source of fiber, vitamin C, potassium, and beneficial antioxidants.",
                    summary_zh="榴莲不仅是水果之王，还富含膳食纤维、维生素C、钾和有益健康的抗氧化剂。",
                    content="Sầu riêng chứa hàm lượng dinh dưỡng vượt trội, giúp bổ sung năng lượng nhanh chóng, giảm cholesterol xấu, bảo vệ tim mạch, cải thiện hệ tiêu hóa và tăng cường tâm trạng nhờ hoạt chất tự nhiên thúc đẩy giải phóng serotonin.",
                    content_en="Durian contains outstanding nutrient levels, helping boost energy quickly, lower bad cholesterol, protect the heart, improve digestion, and enhance mood through natural compounds that promote serotonin release.",
                    content_zh="榴莲含有极高的营养成分，能快速补充能量，降低坏胆固醇，保护心脏，改善消化系统，并通过促进血清素释放的天然活性成分来改善情绪。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Bí quyết chọn Bưởi Da Xanh Bến Tre nhiều nước, ngọt thanh",
                    title_en="Secrets to Choosing Juicy and Sweet Ben Tre Green Peel Pomelos",
                    title_zh="挑选多汁清甜槟知绿皮柚子的秘诀",
                    slug="bi-quyet-chon-buoi-da-xanh-ben-tre-nhieu-nuoc-ngot-thanh",
                    summary="Làm thế nào để chọn được quả bưởi da xanh ngon mọng nước, không bị khô xơ? Hãy bỏ túi ngay các mẹo quan sát vỏ bưởi, cân nặng và tiếng gõ từ nhà vườn.",
                    summary_en="How to choose a juicy green-peel pomelo that isn't dry or fibrous? Memorize these tips on observing the rind, weight, and sound from farmers.",
                    summary_zh="如何挑选一颗多汁且不干瘪的绿皮柚子？牢记果农分享的观察柚皮、重量 and 敲击声的实用技巧。",
                    content="Bưởi da xanh ngon thường có vỏ căng, gai bưởi nở đều, cầm nặng tay. Khi gõ nhẹ nghe tiếng cạch cạch chứng tỏ vỏ mỏng cùi mọng. Tránh chọn quả nhẹ bẫng hoặc vỏ sần sùi quá mức vì có thể cùi dày, ít nước.",
                    content_en="A good green-peel pomelo has a tight rind, well-spaced oil glands, and feels heavy. Tapping it gently should yield a solid sound indicating thin skin and juicy flesh. Avoid very light or excessively rough fruit.",
                    content_zh="优质绿皮柚子通常表皮紧致、油胞分布均匀且手感沉甸甸。轻轻敲击时若声音清脆，说明皮薄肉厚。避免选择过轻或过于粗糙的柚子，以免果皮过厚、水分不足。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Hạt Điều Tươi và những giá trị dinh dưỡng cho chế độ ăn lành mạnh",
                    title_en="Fresh Cashews and Nutritional Values for a Healthy Diet",
                    title_zh="新鲜腰果及其健康饮食的营养价值",
                    slug="hat-dieu-tuoi-va-nhung-gia-tri-dinh-duong-cho-che-do-an-lanh-manh",
                    summary="Hạt điều là thực phẩm vàng cho tim mạch và não bộ. Khám phá thành phần dinh dưỡng phong phú và cách sử dụng hạt điều hiệu quả hàng ngày.",
                    summary_en="Cashew nuts are golden foods for the heart and brain. Discover their rich nutrient composition and how to incorporate them daily.",
                    summary_zh="腰果是有益心脏和大脑的黄金食物。探索其丰富的营养成分以及如何在日常饮食中高效食用。",
                    content="Hạt điều giàu chất béo không bão hòa đơn và đa, magie, sắt và kẽm. Ăn hạt điều vừa đủ giúp giảm nguy cơ tim mạch, củng cố xương khớp và duy trì làn da khỏe đẹp, đồng thời hỗ trợ kiểm soát cân nặng tốt.",
                    content_en="Cashews are rich in monounsaturated and polyunsaturated fats, magnesium, iron, and zinc. Eating them in moderation helps reduce cardiovascular risks, strengthen bones, maintain healthy skin, and assist in weight control.",
                    content_zh="腰果富含单不饱和和多不饱和脂肪、镁、铁 và 锌。适量食用腰果有助于降低心血管 risks，强健骨骼，保持皮肤健康，并有助于控制体重。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Trà Ô Long - Liều thuốc tự nhiên giúp thư giãn và giải độc cơ thể",
                    title_en="Oolong Tea - A Natural remedy for Relaxation and Detoxification",
                    title_zh="乌龙茶——放松和排毒的天然良药",
                    slug="tra-o-long-lieu-thuoc-tu-nhien-giup-thu-gian-va-giai-doc-co-the",
                    summary="Không chỉ là thức uống thơm ngon, trà Ô Long còn chứa lượng lớn polyphenol giúp trung hòa gốc tự do, giảm stress và hỗ trợ thanh lọc cơ thể.",
                    summary_en="More than just a delicious beverage, Oolong tea contains large amounts of polyphenols that neutralize free radicals, reduce stress, and aid body detox.",
                    summary_zh="乌龙茶不仅是一道美味的饮品，还含有大量的多酚，有助于中和自由基、减轻压力并促进体内排毒。",
                    content="Nghiên cứu cho thấy chất L-theanine trong trà Ô Long giúp tăng sóng não alpha, mang lại cảm giác thư thái tỉnh táo. EGCG và các chất chống oxy hóa thúc đẩy quá trình trao đổi chất, hỗ trợ giảm cân và làm sạch hệ tiêu hóa.",
                    content_en="Studies show L-theanine in Oolong tea increases alpha brain waves, bringing relaxed alertness. EGCG and other antioxidants boost metabolism, aid weight loss, and cleanse the digestive system.",
                    content_zh="研究表明，乌龙茶中的L-茶氨酸有助于增加大脑阿尔法波，带来放松 và 警觉感。EGCG等抗氧化剂能促进新陈代谢，帮助减肥，并清洁消化系统。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Giải nhiệt mùa hè với nước chanh dây tươi nguyên chất",
                    title_en="Cool Down in Summer with Fresh Pure Passion Fruit Juice",
                    title_zh="夏天喝纯百香果汁解暑",
                    slug="giai-nhiet-mua-he-voi-nuoc-chanh-day-tuoi-nguyen-chat",
                    summary="Chanh dây là nguyên liệu tuyệt vời để pha chế các món nước giải khát. Học ngay công thức làm nước chanh dây đá thơm ngon chuẩn vị tại nhà.",
                    summary_en="Passion fruit is an excellent ingredient for refreshing summer drinks. Learn the recipe to make delicious iced passion fruit juice at home.",
                    summary_zh="百香果是制作夏季解暑饮品的绝佳原料。立即学习在家制作美味冰镇百香果汁的食谱。",
                    content="Nước chanh dây giàu vitamin A, C và chất xơ. Cách làm rất đơn giản: lấy ruột chanh dây, pha với nước ấm, thêm chút đường phèn hoặc mật ong, khuấy đều rồi thêm đá lạnh. Thức uống thanh mát này sẽ xua tan cơn nóng tức thì.",
                    content_en="Passion fruit juice is rich in vitamins A, C, and fiber. Simply scoop out the pulp, mix with warm water, add some rock sugar or honey, stir, and add ice. This cooling drink beats the heat instantly.",
                    content_zh="百香果汁富含维生素A、C和膳食纤维。制作方法简单：挖出百香果果肉，混入温水，加入少许冰糖或蜂蜜，搅拌均匀，然后加入冰块。这款清爽的饮品能瞬间驱散夏日的炎热。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="VietGAP là gì và tầm quan trọng trong nông nghiệp hiện đại",
                    title_en="What is VietGAP and Its Importance in Modern Agriculture",
                    title_zh="什么是VietGAP及其在现代农业中的重要性",
                    slug="vietgap-la-gi-va-tam-quan-trong-trong-nong-nghiep-hien-dai",
                    summary="Tìm hiểu về tiêu chuẩn VietGAP - thước đo đánh giá chất lượng nông sản sạch, đảm bảo an toàn vệ sinh thực phẩm và sức khỏe người tiêu dùng.",
                    summary_en="Learn about the VietGAP standard - the benchmark for evaluating clean agricultural quality, ensuring food hygiene and safety.",
                    summary_zh="了解VietGAP标准——评估清洁农产品 quality 的基准，确保食品卫生安全 and 消费者健康。",
                    content="VietGAP (Vietnamese Good Agricultural Practices) gồm các quy định về kỹ thuật sản xuất sạch. Nó kiểm soát nghiêm ngặt nguồn nước, đất canh tác, thuốc bảo vệ thực vật nhằm đem lại nông sản không nhiễm hóa chất độc hại, thân thiện với môi trường.",
                    content_en="VietGAP (Vietnamese Good Agricultural Practices) comprises regulations for clean production. It strictly controls water, soil, and pesticides to deliver chemical-free and environmentally friendly agricultural products.",
                    content_zh="VietGAP（越南良好农业规范）包含有关清洁生产的技术规定。它严格控制水源、耕作土壤和农药使用，以提供无有害化学残留且环境友好型的农产品。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Lợi ích tuyệt vời của hạt bí xanh hữu cơ đối với làn da",
                    title_en="Amazing Benefits of Organic Pumpkin Seeds for Skin Health",
                    title_zh="有机绿皮南瓜子对皮肤健康的惊人益处",
                    slug="loi-ich-tuyet-voi-cua-hat-bi-xanh-huu-co-doi-voi-lan-da",
                    summary="Hạt bí xanh hữu cơ chứa lượng lớn kẽm và vitamin E - hai hoạt chất hàng đầu giúp tái tạo da, ngăn ngừa mụn và đẩy lùi lão hóa hiệu quả.",
                    summary_en="Organic pumpkin seeds contain large amounts of zinc and vitamin E - two key nutrients for skin regeneration, acne prevention, and anti-aging.",
                    summary_zh="有机南瓜子含有大量的锌和维生素E——这是促进皮肤再生、预防粉刺和抗衰老的两种关键营养素。",
                    content="Kẽm trong hạt bí xanh hỗ trợ kháng viêm, kiểm soát dầu thừa trên da, giúp giảm mụn trứng cá. Vitamin E bảo vệ tế bào da khỏi các gốc tự do gây hại, duy trì độ ẩm tự nhiên, mang lại làn da mịn màng tươi trẻ.",
                    content_en="Zinc in pumpkin seeds helps reduce inflammation and control excess sebum, preventing acne. Vitamin E protects skin cells from free radical damage, maintaining natural moisture for smooth, youthful skin.",
                    content_zh="南瓜子中的锌有助于消炎和控制多余油脂，从而预防粉刺。维生素E保护皮肤细胞免受自由基损伤，保持天然水分，使肌肤光滑年轻。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Mẹo bảo quan trái cây luôn tươi ngon, không mất dưỡng chất",
                    title_en="Tips to Store Fruits Fresh Longer Without Losing Nutrients",
                    title_zh="保持水果新鲜且不流失营养的储存技巧",
                    slug="meo-bao-quan-trai-cay-luon-tuoi-ngon-khong-mat-duong-chat",
                    summary="Bảo quản trái cây đúng cách không chỉ kéo dài thời gian sử dụng mà còn giữ vẹn nguyên hàm lượng vitamin quý giá bên trong.",
                    summary_en="Proper fruit storage not only extends shelf life but also preserves the precious vitamins and nutrients inside.",
                    summary_zh="正确储存水果不仅能延长保质期，还能保留其内部珍贵的维生素和营养成分。",
                    content="Mỗi loại trái cây có cách bảo quản khác nhau. Quả nhạy cảm với ethylene như chuối, táo nên để riêng. Trái cây chưa chín như bơ, xoài nên để ngoài nhiệt độ phòng đến khi chín mới cho vào tủ lạnh để tránh bị sượng.",
                    content_en="Different fruits require different storage methods. Ethylene-sensitive fruits like bananas and apples should be kept separate. Unripe fruits like avocados and mangoes should be kept at room temperature until ripe before refrigerating.",
                    content_zh="不同的水果需要不同的储存方法。香蕉和苹果等对乙烯敏感的水果应分开存放。未成熟的水果如牛油果、芒果应在常温下存放，待成熟后再放入冰箱冷藏以防发硬。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Tại sao nông sản hữu cơ Organic ngày càng được ưa chuộng?",
                    title_en="Why is Organic Agricultural Produce Becoming More Popular?",
                    title_zh="为什么有机农产品越来越受欢迎？",
                    slug="tai-sao-nong-san-huu-co-organic-ngay-cang-duoc-ua-chuong",
                    summary="Nông sản hữu cơ được xem là xu hướng tiêu dùng thông minh. Cùng giải mã lý do người tiêu dùng sẵn sàng trả chi phí cao hơn cho các sản phẩm Organic.",
                    summary_en="Organic agricultural produce is seen as a smart consumer trend. Decode the reasons why consumers are willing to pay more for organic products.",
                    summary_zh="有机农产品被视为一种明智的消费趋势。揭秘为什么消费者愿意为有机产品支付更高的价格。",
                    content="Nông nghiệp hữu cơ từ chối phân bón hóa học, thuốc trừ sâu tổng hợp và sinh vật biến đổi gen. Sản phẩm thu được giàu hương vị tự nhiên, an toàn tuyệt đối và quy trình sản xuất thân thiện, bảo vệ hệ sinh thái bền vững.",
                    content_en="Organic farming rejects chemical fertilizers, synthetic pesticides, and GMOs. The resulting products are rich in natural flavor, absolutely safe, and produced through eco-friendly practices that protect the ecosystem.",
                    content_zh="有机农业拒绝使用化学肥料、合成农药和转基因生物。所得产品富含天然风味，绝对安全，且生产过程环保，保护生态系统可持续发展。",
                    image_url=None,
                    is_published=True
                ),
                Blog(
                    title="Cách làm sinh tố bơ hạt chia thơm ngon bổ dưỡng tại nhà",
                    title_en="How to Make Delicious and Nutritious Avocado Chia Seed Smoothie",
                    title_zh="如何在家制作美味又营养的牛油果奇亚籽奶昔",
                    slug="cach-lam-sinh-to-bo-hat-chia-thom-ngon-bo-duong-tai-nha",
                    summary="Sinh tố bơ kết hợp hạt chia là bữa sáng nhanh gọn, cung cấp đầy đủ chất béo lành mạnh, chất xơ và năng lượng hoạt động cho cả ngày dài.",
                    summary_en="Avocado smoothie combined with chia seeds makes a quick breakfast, providing healthy fats, fiber, and energy for the whole day.",
                    summary_zh="Avocado smoothie combined with chia seeds makes a quick breakfast, providing healthy fats, fiber, and energy for the whole day.",
                    content="Xay nhuyễn thịt 1 quả bơ sáp chín với 100ml sữa tươi, 2 thìa sữa đặc và đá viên. Rót ra ly rồi rắc hạt chia đã ngâm nở lên trên. Món sinh tố béo ngậy thanh mát này rất thích hợp để làm đẹp da và giữ dáng.",
                    content_en="Blend the flesh of 1 ripe avocado with 100ml fresh milk, 2 tablespoons condensed milk, and ice. Pour into a glass and sprinkle soaked chia seeds on top. This rich and cooling smoothie is perfect for skin and fitness.",
                    content_zh="将1个熟牛油果果肉与100毫升鲜牛奶、2汤匙炼乳和冰块混合搅拌。倒入杯中，撒上泡发好的奇亚籽。这款浓郁清凉的奶昔非常适合美容和保持身材。",
                    image_url=None,
                    is_published=True
                )
            ]
            # Map blog titles to appropriate dynamic tags and colors
            tags_map = {
                "Cách Chọn Bơ Sáp": ("Mẹo chọn quả", "Selection Tips", "选果窍门", "amber"),
                "Quy Trình Canh Tác": ("Kinh nghiệm canh tác", "Cultivation Tips", "种植经验", "emerald"),
                "Lợi Ích Sức Khỏe Tuyệt Vời": ("Dinh dưỡng & Sức khỏe", "Nutrition & Health", "营养与健康", "blue"),
                "Lợi ích sức khỏe vượt trội": ("Dinh dưỡng & Sức khỏe", "Nutrition & Health", "营养与健康", "blue"),
                "Bí quyết chọn Bưởi": ("Mẹo chọn quả", "Selection Tips", "选果窍门", "amber"),
                "Hạt Điều Tươi": ("Dinh dưỡng & Sức khỏe", "Nutrition & Health", "营养与健康", "blue"),
                "Trà Ô Long": ("Dinh dưỡng & Sức khỏe", "Nutrition & Health", "营养与健康", "blue"),
                "Giải nhiệt mùa hè": ("Thức uống bổ dưỡng", "Healthy Drinks", "健康饮品", "purple"),
                "VietGAP là gì": ("Tiêu chuẩn nông sản", "Standards & Quality", "农产品标准", "slate"),
                "Lợi ích tuyệt vời của hạt bí": ("Làm đẹp & Sức khỏe", "Beauty & Health", "美容与健康", "rose"),
                "Mẹo bảo quan": ("Bảo quản thực phẩm", "Storage Tips", "保鲜窍门", "emerald"),
                "Tại sao nông sản hữu cơ": ("Kiến thức nông sản", "Organic Knowledge", "有机常识", "slate"),
                "Cách làm sinh tố bơ": ("Món ngon bổ dưỡng", "Recipes & Cooking", "健康食谱", "purple"),
            }

            for b in mock_blogs:
                matched = False
                for prefix, (tag_vi, tag_en, tag_zh, color) in tags_map.items():
                    if b.title.startswith(prefix):
                        b.tag = tag_vi
                        b.tag_en = tag_en
                        b.tag_zh = tag_zh
                        b.tag_color = color
                        matched = True
                        break
                if not matched:
                    b.tag = "Kinh nghiệm nhà nông"
                    b.tag_en = "Farmer's Experience"
                    b.tag_zh = "农人经验"
                    b.tag_color = "emerald"
                session.add(b)
            session.commit()

        # Seed default testimonials if database has no testimonials
        statement_t = select(Testimonial)
        existing_testimonials = session.exec(statement_t).all()
        if not existing_testimonials:
            mock_testimonials = [
                Testimonial(
                    name="Chị Mai Anh",
                    region="Quận 1, TP.HCM",
                    region_en="District 1, Ho Chi Minh City",
                    region_zh="胡志明市第一区",
                    rating=5,
                    content="Bơ sáp mua ở đây rất dẻo và béo, chín đều không bị thối đầu như mua ngoài chợ. Các bạn tư vấn qua Zalo cực kỳ nhiệt tình, giao hàng cũng nhanh.",
                    content_en="The avocados bought here are very rich and buttery, ripening evenly without rotting at the stem. Zalo customer service is extremely enthusiastic and delivery is fast.",
                    content_zh="在这里买的牛油果非常软糯浓郁，熟得很均匀，没有烂蒂。Zalo客服非常热情，送货速度也很快。",
                    avatar_url=None
                ),
                Testimonial(
                    name="Anh Tuấn",
                    region="Cầu Giấy, Hà Nội",
                    region_en="Cau Giay District, Hanoi",
                    region_zh="河内市求纸区",
                    rating=5,
                    content="Macca giòn, thơm và nứt vỏ rất dễ bóc. Mình hay mua làm quà tặng đối tác, đóng hộp gỗ trông rất lịch sự và sang trọng.",
                    content_en="The macadamia nuts are crunchy, fragrant, and easy to crack open. I often buy them as gifts for partners, the wooden packaging looks very polite and premium.",
                    content_zh="夏威夷果很香脆，外壳很容易剥开。我经常买来送给合作伙伴，木盒包装显得非常大方得体且高端。",
                    avatar_url=None
                ),
                Testimonial(
                    name="Cô Lan",
                    region="Hải Châu, Đà Nẵng",
                    region_en="Hai Chau District, Da Nang",
                    region_zh="岘港市海洲区",
                    rating=5,
                    content="Xoài ngọt lịm, hái chín tự nhiên nên có mùi thơm đặc trưng lắm. Đã mua lần thứ 3 và rất yên tâm về chất lượng an toàn vệ sinh.",
                    content_en="The mangoes are incredibly sweet, naturally tree-ripened so they have a very distinct aroma. I have bought for the third time and feel very assured about the quality and hygiene.",
                    content_zh="芒果超级甜，是自然熟的，所以有一种很特别的果香。已经买第三次了，对这儿的卫生和质量非常放心。",
                    avatar_url=None
                )
            ]
            for t in mock_testimonials:
                session.add(t)
            session.commit()

        # Update existing items with English/Chinese translations if they are empty
        # Categories
        session.execute(text("UPDATE category SET name_en = 'Fresh fruits', name_zh = '新鲜水果' WHERE slug = 'trai-cay-tuoi' AND name_en IS NULL"))
        session.execute(text("UPDATE category SET name_en = 'Nutritious seeds', name_zh = '营养坚果' WHERE slug = 'hat-dinh-duong' AND name_en IS NULL"))
        session.execute(text("UPDATE category SET name_en = 'Beverages', name_zh = '饮品' WHERE slug = 'do-uong' AND name_en IS NULL"))
        
        # Products
        session.execute(text("""
            UPDATE product SET 
                name_en = 'Premium Dak Lak Avocado (Grade 1)', 
                name_zh = '得乐省特级牛油果 (1级)',
                description_en = 'Grade 1 avocado, round and large fruit, rich yellow and buttery texture, thin glossy skin. Naturally ripened and harvested directly from Dak Lak orchard. High nutritional value, perfect for smoothies, salads, or baby food.',
                description_zh = '得乐省特级牛油果（1级），果实圆润饱满，果肉金黄软糯，表皮薄而光滑。在得乐省果园自然成熟并直接采摘。营养价值高，非常适合制作沙冰、沙拉 or 作为婴儿辅食。'
            WHERE slug = 'bo-sap-dak-lak-loai-1' AND name_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE product SET 
                name_en = 'Wind-Dried Cracked Macadamia Nuts', 
                name_zh = '风干开壳夏威夷果',
                description_en = 'Naturally cracked macadamia nuts, wind-dried to preserve their signature rich and buttery flavor. Each box includes a shell opener. Ideal as a healthy nutritional gift for your family.',
                description_zh = '自然开壳的夏威夷果，采用风干技术以保留其特有的浓郁奶香与酥脆口感。每盒附赠开壳工具。是送给家人的理想健康营养礼品。'
            WHERE slug = 'mac-ca-nut-vo-say-gio' AND name_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE product SET 
                name_en = 'Tree-Ripened Hoa Loc Mangoes', 
                name_zh = '树上熟和禄沙芒果',
                description_en = 'Hoa Loc mangoes are famous for their intense sweetness, thick flesh with minimal fiber, and rich aroma. Naturally harvested fully ripe on the tree, without any chemical ripening agents.',
                description_zh = '和禄沙芒果以其浓郁的甜度、丰厚的果肉（少丝）和馥郁 of 香气而闻名。树上自然熟透后采摘，不使用 any 化学催熟剂。'
            WHERE slug = 'xoai-cat-hoa-loc-chin-cay' AND name_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE product SET 
                name_en = 'Honey-Processed Robusta Coffee', 
                name_zh = '蜜处理罗布斯塔咖啡豆',
                description_en = 'Robusta coffee beans processed using the Honey method, retaining the natural sugar layer beneath the cherry skin. Rich body, long-lasting sweet aftertaste, and a subtle fruit aroma.',
                description_zh = '采用蜜处理（Honey Process）的罗布斯塔咖啡豆，保留了果皮下天然的糖分层。口感醇厚，回甘持久，伴有淡淡的花果香气。'
            WHERE slug = 'ca-phe-robusta-mat-ong' AND name_en IS NULL
        """))
        
        # Blogs
        session.execute(text("""
            UPDATE blog SET 
                title_en = 'How to Choose Rich, Buttery Dak Lak Avocados Without Bitterness', 
                title_zh = '如何挑选软糯浓郁且不发苦的得乐省牛油果',
                summary_en = 'Avocado is a highly nutritious fruit but it is easy to accidentally buy watery or bitter ones. Explore 5 golden tips from Dak Lak farmers to help you always select the best avocado.',
                summary_zh = '牛油果营养丰富，但很容易买到水汪汪或发苦的果实。探索得乐省果农分享的5个黄金秘诀，帮助您挑选出最完美的牛油果。',
                content_en = 'Avocado is a highly nutritious fruit but it is easy to accidentally buy watery or bitter ones. Explore 5 golden tips from Dak Lak farmers to help you always select the best avocado. Detailed guide on selecting avocados with glossy but slightly rough skin, dry stem pocket, and rich yellow, buttery flesh.',
                content_zh = '牛油果营养丰富，但很容易买到水汪汪或发苦 of 果实。探索得乐省果农分享的5个黄金秘诀，帮助您挑选出最完美的牛油果。详细介绍如何根据表皮微粗糙、果蒂干燥以及果肉金黄软糯等特征来进行挑选。'
            WHERE slug = 'cach-chon-bo-sap-dak-lak-deo-beo-khong-suong-bot' AND title_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE blog SET 
                title_en = 'Quy Trình Canh Tác Mắc Ca Đạt Chuẩn VietGAP Tại Vườn', 
                title_zh = '果园中符合VietGAP标准的夏威夷果种植流程',
                summary_en = 'Behind the crunchy, rich, and nutrient-dense macadamia nuts is a strict cultivation process, from applying organic fertilizers to natural wind-drying and harvesting techniques ensuring food safety.',
                summary_zh = '香脆、营养丰富的夏威夷果背后，是一套严格的种植和加工流程：从施用有机肥，到自然风干以及确保食品安全的采收技术。',
                content_en = 'Behind the crunchy, rich, and nutrient-dense macadamia nuts is a strict cultivation process, from applying organic fertilizers to natural wind-drying and harvesting techniques ensuring food safety. The process includes monitoring soil quality, irrigation water, and harvesting only when the nuts reach optimal maturity.',
                content_zh = '香脆、营养丰富的夏威夷果背后，是一套严格的种植和加工流程：从施用有机肥，到自然风干以及确保食品安全的采收技术。该流程包括对土壤质量、灌溉水源的严格监控，并仅在坚果达到最佳成熟度时进行采收。'
            WHERE slug = 'quy-trinh-canh-tac-mac-ca-dat-chuan-vietgap-tai-vuon' AND title_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE blog SET 
                title_en = 'Amazing Health Benefits of Wind-Dried Macadamia Nuts', 
                title_zh = '风干夏威夷果令人惊叹的的健康益处',
                summary_en = 'Macadamia is crowned as the queen of dried fruits. Discover the unexpected benefits for heart health, brain function, and skin beauty when eating macadamia nuts daily with Nong San Sach.',
                summary_zh = '夏威夷果被誉为干果皇后。与“Nông Sản Sạch”一起探索每天食用夏威夷果对心脏健康、大脑功能和美容护肤带来的惊喜益处。',
                content_en = 'Macadamia is crowned as the queen of dried fruits. Discover the unexpected benefits for heart health, brain function, and skin beauty when eating macadamia nuts daily with Nong San Sach. Macadamia nuts contain high amounts of monounsaturated fatty acids which are good for the heart, support lower bad cholesterol, and provide rich energy.',
                content_zh = '夏威夷果被誉为干果皇后。与“Nông Sản Sạch”一起探索每天食用夏威夷果对心脏健康、大脑功能 and 美容护肤带来的惊喜益处。夏威夷果富含对心脏有益的单不饱和脂肪酸，有助于降低坏胆固醇，并提供充足的能量。'
            WHERE slug = 'lo-ich-suc-khoe-tuyet-voi-cua-hat-mac-ca-say-gio' AND title_en IS NULL
        """))
        
        # Testimonials
        session.execute(text("""
            UPDATE testimonial SET 
                content_en = 'The avocados bought here are very rich and buttery, ripening evenly without rotting at the stem. Zalo customer service is extremely enthusiastic and delivery is fast.',
                content_zh = '在这里买 of 牛油果非常软糯浓郁，熟得很均匀，没有烂蒂。Zalo客服非常热情，送货速度也很快。',
                region_en = 'District 1, Ho Chi Minh City',
                region_zh = '胡志明市第一区'
            WHERE name = 'Chị Mai Anh' AND content_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE testimonial SET 
                content_en = 'The macadamia nuts are crunchy, fragrant, and easy to crack open. I often buy them as gifts for partners, the wooden packaging looks very polite and premium.',
                content_zh = '夏威夷果很香脆，外壳很容易剥开。我经常买来送给合作伙伴，木盒包装显得非常大方得体且高端。',
                region_en = 'Cau Giay District, Hanoi',
                region_zh = '河内市求纸区'
            WHERE name = 'Anh Tuấn' AND content_en IS NULL
        """))
        
        session.execute(text("""
            UPDATE testimonial SET 
                content_en = 'The mangoes are incredibly sweet, naturally tree-ripened so they have a very distinct aroma. I have bought for the third time and feel very assured about the quality and hygiene.',
                content_zh = '芒果超级甜，是自然熟的，所以有一种很特别 of 果香。已经买第三次了，对这儿的卫生和质量非常放心。',
                region_en = 'Hai Chau District, Dan Nang',
                region_zh = '岘港市海洲区'
            WHERE name = 'Cô Lan' AND content_en IS NULL
        """))
        
        session.commit()

def get_db():
    with Session(engine) as session:
        yield session
