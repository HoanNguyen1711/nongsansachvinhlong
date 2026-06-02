-- Script DML to add Bưởi Da Xanh Bến Tre and Chanh Không Hạt Long An
INSERT INTO product (
    name, name_en, name_zh, slug, 
    description, description_en, description_zh, 
    price, original_price, image_url, category, 
    is_available, created_at, updated_at
) VALUES (
    'Bưởi Da Xanh Bến Tre', 
    'Ben Tre Green Peel Pomelo', 
    '槟知绿皮柚子', 
    'buoi-da-xanh-ben-tre',
    'Bưởi da xanh đặc sản Bến Tre quả to tròn, vỏ mỏng màu xanh đậm, tép bưởi hồng mọng nước, vị ngọt thanh mát không bị đắng. Đạt tiêu chuẩn an toàn VietGAP.',
    'Ben Tre green peel pomelo features large round fruits, thin dark green skin, pink juicy segments, and a refreshing sweet taste with no bitterness. Grown under VietGAP standards.',
    '槟知绿皮柚子，果大圆整，皮薄呈深绿色，果肉粉红多汁，口感清甜无苦味。符合VietGAP安全标准。',
    65000.0, 
    80000.0, 
    NULL, 
    'Trái cây tươi', 
    1, 
    strftime('%Y-%m-%d %H:%M:%S', 'now'), 
    strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT INTO product (
    name, name_en, name_zh, slug, 
    description, description_en, description_zh, 
    price, original_price, image_url, category, 
    is_available, created_at, updated_at
) VALUES (
    'Chanh Không Hạt Long An', 
    'Long An Seedless Lime', 
    '隆安无籽柠檬', 
    'chanh-khong-hat-long-an',
    'Chanh không hạt Long An quả to tròn, vỏ mỏng căng mịn, mọng nước và có mùi thơm nồng đặc trưng. Rất giàu vitamin C, tốt cho sức khỏe và hệ tiêu hóa.',
    'Long An seedless lime is large and round with thin, smooth skin, extremely juicy and aromatic. Highly rich in vitamin C, beneficial for health and digestion.',
    '隆安无籽柠檬，果大圆润，皮薄光滑，多汁且香气浓郁。富含维生素C，有益健康与消化。',
    25000.0, 
    30000.0, 
    NULL, 
    'Trái cây tươi', 
    1, 
    strftime('%Y-%m-%d %H:%M:%S', 'now'), 
    strftime('%Y-%m-%d %H:%M:%S', 'now')
);
