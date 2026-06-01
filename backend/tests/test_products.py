from fastapi.testclient import TestClient

def test_get_products_empty(client: TestClient):
    response = client.get("/api/products/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_product_success(client: TestClient, admin_token_headers: dict):
    product_data = {
        "name": "Cam Sành Sấy Dẻo",
        "slug": "cam-sanh-say-deo",
        "description": "Cam sành chín sấy dẻo tự nhiên",
        "price": 85000,
        "original_price": 95000,
        "image_url": "/static/uploads/cam-sanh.webp",
        "category": "Trái cây tươi",
        "is_available": True
    }
    response = client.post("/api/products/", json=product_data, headers=admin_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Cam Sành Sấy Dẻo"
    assert data["slug"] == "cam-sanh-say-deo"
    assert data["price"] == 85000
    assert "id" in data

def test_create_product_duplicate_slug(client: TestClient, admin_token_headers: dict):
    product_data = {
        "name": "Cam Sành Sấy Dẻo",
        "slug": "cam-sanh-say-deo",
        "category": "Trái cây tươi"
    }
    # Create first one
    client.post("/api/products/", json=product_data, headers=admin_token_headers)
    # Create second one with same slug
    response = client.post("/api/products/", json=product_data, headers=admin_token_headers)
    assert response.status_code == 400
    assert "slug" in response.json()["detail"].lower() or "tĩnh" in response.json()["detail"].lower()

def test_create_product_unauthorized(client: TestClient):
    product_data = {
        "name": "Cam Sành Sấy Dẻo",
        "slug": "cam-sanh-say-deo",
        "category": "Trái cây tươi"
    }
    response = client.post("/api/products/", json=product_data)
    assert response.status_code == 401

def test_read_product_by_slug(client: TestClient, admin_token_headers: dict):
    product_data = {
        "name": "Xoài Cát Sấy Dẻo",
        "slug": "xoai-cat-say-deo",
        "category": "Trái cây tươi"
    }
    client.post("/api/products/", json=product_data, headers=admin_token_headers)
    
    # Get by slug
    response = client.get("/api/products/xoai-cat-say-deo")
    assert response.status_code == 200
    assert response.json()["name"] == "Xoài Cát Sấy Dẻo"

def test_update_product(client: TestClient, admin_token_headers: dict):
    # Create a product
    product_data = {
        "name": "Ổi Sấy Dẻo",
        "slug": "oi-say-deo",
        "category": "Trái cây tươi",
        "price": 60000
    }
    created = client.post("/api/products/", json=product_data, headers=admin_token_headers).json()
    product_id = created["id"]
    
    # Update product
    update_data = {
        "price": 65000,
        "name": "Ổi Sấy Dẻo Loại 1"
    }
    response = client.put(f"/api/products/{product_id}", json=update_data, headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 65000
    assert data["name"] == "Ổi Sấy Dẻo Loại 1"

def test_delete_product(client: TestClient, admin_token_headers: dict):
    # Create a product
    product_data = {
        "name": "Đu Đủ Sấy Dẻo",
        "slug": "du-du-say-deo",
        "category": "Trái cây tươi"
    }
    created = client.post("/api/products/", json=product_data, headers=admin_token_headers).json()
    product_id = created["id"]
    
    # Delete product
    response = client.delete(f"/api/products/{product_id}", headers=admin_token_headers)
    assert response.status_code == 204
    
    # Verify product is deleted
    response = client.get(f"/api/products/du-du-say-deo")
    assert response.status_code == 404
