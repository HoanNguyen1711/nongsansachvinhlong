from fastapi.testclient import TestClient

def test_get_blogs_empty(client: TestClient):
    response = client.get("/api/blogs/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_blog_success(client: TestClient, admin_token_headers: dict):
    blog_data = {
        "title": "Mẹo bảo quản bơ lâu chín",
        "slug": "meo-bao-quan-bo-lau-chin",
        "summary": "Chia sẻ cách giữ bơ xanh tươi ngon trong tủ lạnh.",
        "content": "Đây là nội dung chi tiết bài viết chia sẻ mẹo vặt của nông trại.",
        "image_url": "/static/uploads/bo-bao-quan.webp",
        "is_published": True
    }
    response = client.post("/api/blogs/", json=blog_data, headers=admin_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Mẹo bảo quản bơ lâu chín"
    assert data["slug"] == "meo-bao-quan-bo-lau-chin"
    assert "id" in data

def test_create_blog_unauthorized(client: TestClient):
    blog_data = {
        "title": "Mẹo bảo quản bơ",
        "slug": "meo-bao-quan-bo",
        "content": "Nội dung"
    }
    response = client.post("/api/blogs/", json=blog_data)
    assert response.status_code == 401

def test_read_blog_by_slug(client: TestClient, admin_token_headers: dict):
    blog_data = {
        "title": "Công thức làm sinh tố bơ hạt chia",
        "slug": "sinh-to-bo-hat-chia",
        "content": "Chi tiết công thức pha chế bổ dưỡng."
    }
    client.post("/api/blogs/", json=blog_data, headers=admin_token_headers)
    
    # Get by slug
    response = client.get("/api/blogs/sinh-to-bo-hat-chia")
    assert response.status_code == 200
    assert response.json()["title"] == "Công thức làm sinh tố bơ hạt chia"

def test_update_blog(client: TestClient, admin_token_headers: dict):
    # Create blog
    blog_data = {
        "title": "Cách ăn hạt mắc ca đúng cách",
        "slug": "cach-an-mac-ca",
        "content": "Nội dung cũ"
    }
    created = client.post("/api/blogs/", json=blog_data, headers=admin_token_headers).json()
    blog_id = created["id"]
    
    # Update blog
    update_data = {
        "title": "Cách ăn hạt mắc ca thơm ngon đúng cách",
        "content": "Nội dung mới béo ngậy hơn"
    }
    response = client.put(f"/api/blogs/{blog_id}", json=update_data, headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Cách ăn hạt mắc ca thơm ngon đúng cách"
    assert data["content"] == "Nội dung mới béo ngậy hơn"

def test_delete_blog(client: TestClient, admin_token_headers: dict):
    # Create blog
    blog_data = {
        "title": "Vườn nhà tôm bơ chất lượng",
        "slug": "vuon-nha-tom-bo",
        "content": "Nội dung giới thiệu"
    }
    created = client.post("/api/blogs/", json=blog_data, headers=admin_token_headers).json()
    blog_id = created["id"]
    
    # Delete blog
    response = client.delete(f"/api/blogs/{blog_id}", headers=admin_token_headers)
    assert response.status_code == 204
    
    # Verify blog is deleted
    response = client.get("/api/blogs/vuon-nha-tom-bo")
    assert response.status_code == 404
