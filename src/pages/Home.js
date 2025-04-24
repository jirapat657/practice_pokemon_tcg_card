import React, { useState, useEffect, useMemo } from 'react';
import '../App.css'; // สไตล์หลัก
import axios from 'axios';
import { Row, Col, Card, Select, Button, Space, Input, Pagination, Spin, message, Drawer, Grid, Divider, Badge } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined, ShoppingOutlined} from '@ant-design/icons';

const { Option } = Select;

export default function SixColumnsGridWithSearchAndFilters() {
  // State สำหรับข้อมูลการ์ด
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [rarityFilter, setRarityFilter] = useState(null);
  const [setFilter, setSetFilter] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [cart, setCart] = useState([]);
  const { useBreakpoint } = Grid;

  const pageSize = 20;

  // Fetch API เมื่อ component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://api.pokemontcg.io/v2/cards'); //ใช้axiosในการดึง api
        console.log('API response:', res); // << แสดงทั้ง response
        console.log('Card data:', res.data.data); // << แสดงเฉพาะ array ข้อมูลการ์ด
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching data:', err); // << แสดง error ถ้ามี
        message.error('โหลดข้อมูลล้มเหลว');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ฟิลเตอร์ข้อมูล
  const filteredData = data.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const typeMatch = typeFilter ? item.types?.includes(typeFilter) : true;
    const rarityMatch = rarityFilter ? item.rarity === rarityFilter : true;
    const setMatch = setFilter ? item.set?.name === setFilter : true;
    return nameMatch && typeMatch && rarityMatch && setMatch;
  });

  // คำนวณ slice สำหรับ pagination
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // แสดง Drawer
  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  // ล้างตัวกรองทั้งหมด
  const handleClearFilters = () => {
    setSearchText('');
    setTypeFilter(null);
    setRarityFilter(null);
    setSetFilter(null);
  };

  //AddCardเข้าตะกร้า
  const handleAddToCart = (card) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === card.id);
      if (exists) {
        return prev.map((item) => item.id === card.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { ...card, quantity: 1 }];
      }
    });
  };

  //บอกจำนวนcardในตะกร้า
  const updateQuantity = (productId, change) => {
    setCart((prevItems) => {
      return prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0); // เอาออกเลยถ้าเหลือ 0
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.cardmarket?.prices?.averageSellPrice || 0) * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const screens = useBreakpoint();

  //animation add item to cart
  const animateToCart = (e) => {
    const cartBtn = document.querySelector('.cart-btn');
    const cardImg = e.currentTarget.closest('.ant-card').querySelector('img');
    if (!cartBtn || !cardImg) return;

    const imgRect = cardImg.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    const flyImg = document.createElement('img');
    flyImg.src = cardImg.src;
    flyImg.style.position = 'fixed';
    flyImg.style.left = `${imgRect.left}px`;
    flyImg.style.top = `${imgRect.top}px`;
    flyImg.style.width = `${imgRect.width}px`;
    flyImg.style.height = `${imgRect.height}px`;
    flyImg.style.transition = 'all 0.7s ease-in-out';
    flyImg.style.zIndex = 9999;
    flyImg.style.borderRadius = '10px';

    document.body.appendChild(flyImg);

    requestAnimationFrame(() => {
      flyImg.style.left = `${cartRect.left + cartRect.width / 2 - imgRect.width / 4}px`;
      flyImg.style.top = `${cartRect.top + cartRect.height / 2 - imgRect.height / 4}px`;
      flyImg.style.width = '0px';
      flyImg.style.height = '0px';
      flyImg.style.opacity = 0;
    });

    setTimeout(() => {
      document.body.removeChild(flyImg);
    }, 700);
  };

  //หาความกว้างที่สุดของตัวอักษรในoption
  const getMaxOptionWidth = (options) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '14px "Roboto", "Helvetica Neue", Arial'; // ฟอนต์ที่ใช้กับ Select
  
    let maxWidth = 0;
    options.forEach(option => {
      const width = context.measureText(option).width;
      if (width > maxWidth) maxWidth = width;
    });
  
    return maxWidth + 60; // เพิ่ม padding สำหรับ dropdown
  };
  //ความกว้างช่องเริ่มต้น100
  const [setWidth, setSetWidth] = useState(100);
  const [rarityWidth, setRarityWidth] = useState(100);
  const [typeWidth, setTypeWidth] = useState(100);
  
  //useMemo ใช้คำนวณ setOptions, rarityOptions, typeOptions แค่ตอน data เปลี่ยน
  const setOptions = useMemo(() => {
    return [...new Set(data.map(item => item.set?.name).filter(Boolean))];
  }, [data]);
  
  const rarityOptions = useMemo(() => {
    return [...new Set(data.map(item => item.rarity).filter(Boolean))];
  }, [data]);
  
  const typeOptions = useMemo(() => {
    return [...new Set(data.flatMap(item => item.types || []).filter(Boolean))];
  }, [data]);
  //setความกว้างที่สุดของตัวนั้น
  useEffect(() => {
    setSetWidth(getMaxOptionWidth(setOptions));
    setRarityWidth(getMaxOptionWidth(rarityOptions));
    setTypeWidth(getMaxOptionWidth(typeOptions));
  }, [data]);

  return (
    <div className="App">
      {/* แถวบนสุด: ชื่อหน้าหลัก + Search */}
      <Row gutter={[16,16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}wrap>
        <Col xs={12} sm={{ span: 12, order: 1 }}>
            <h1 style={{ margin: 0 }}>Pokemon Market</h1>      
        </Col>
        <Col xs={12} sm={{ span: 2, order: 3 }} style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={showDrawer}
          className="cart-btn"
          style={{ position: 'relative', padding: '0 12px' }}
        >
          <Badge
            count={totalItems}
            offset={[0, -2]}
            style={{ backgroundColor: 'rgb(25, 118, 210)' }}
          >
            <ShoppingCartOutlined style={{ fontSize: '20px' }} />
          </Badge>
        </Button>
        </Col>
        <Col xs={24} sm={{ span: 10, order: 2 }}>
          <Input.Search
            placeholder="Search By Name"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
      </Row>

      <Divider />

      {/* แถวตัวกรอง */}
      <Row gutter={[16,16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}wrap>
        <Col xs={12} lg={{ span: 14, order: 1 }}>
          <h2>Choose Card</h2>
        </Col>
        <Col xs={12} lg={{ span: 3, order: 3 }} style={{ textAlign: 'right' }}>
           <Button type="primary" onClick={handleClearFilters}>CLEAR</Button>
        </Col>
        <Col xs={24} lg={{ span: 7, order: 2 }} style={{textAlign: 'center' }}>
          <Space>
            <Select
              placeholder="Set"
              style={{ minWidth: 100, width: 'auto' }}
              dropdownStyle={{ width: setWidth }}
              allowClear
              value={setFilter}
              onChange={(value) => setSetFilter(value)}
            >
              {setOptions.map((o) => (
                <Option key={o} value={o}>{o}</Option>
              ))}
            </Select>
            <Select
              placeholder="Rarity"
              style={{ minWidth: 100, width: 'auto' }}
              dropdownStyle={{ width: rarityWidth }}
              allowClear
              value={rarityFilter}
              onChange={(value) => setRarityFilter(value)}
            >
              {rarityOptions.map((o) => (
                <Option key={o} value={o}>{o}</Option>
              ))}
            </Select>
            <Select
              placeholder="Type"
              style={{ minWidth: 100, width: 'auto' }}
              dropdownStyle={{ width: typeWidth }}
              allowClear
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
            >
              {typeOptions.map((o) => (
                <Option key={o} value={o}>{o}</Option>
              ))}
            </Select>
          </Space>
        </Col>
      </Row>

      {/* แถวการ์ด 6 คอลัมน์ พร้อม loading */}
      {loading ? (
        <Spin tip="กำลังโหลดข้อมูล..." />
      ) : (
        <Row gutter={[16, 16]}>
          {paginatedData.map((item) => (
            <Col key={item.id} span={4} xs={24} sm={12} md={8} lg={4}>
              <Card
                cover={<img src={item.images.small} alt={item.name} />}
                title={item.name}
                bordered
                actions={[<Button
                  style={{ backgroundColor: 'rgb(255,255,255,0.08)' }}
                  onClick={(e) => {
                    animateToCart(e);
                    handleAddToCart(item);
                  }}
                >
                  <ShoppingOutlined /> Add To Cart
                </Button>]}
              >
                {/* <p>HP: {item.hp}</p> */}
                <p>$ {item.cardmarket?.prices?.averageSellPrice}  • - Cards</p>
                {/* <p>Type: {item.types && item.types.join(', ')}</p> */}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      <Row justify="center" style={{ marginTop: 24 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </Row>

      {/* Drawer ด้านขวา */}
      <Drawer
        title="Cart"
        placement="right"
        closable
        onClose={closeDrawer}
        open={isDrawerVisible}
        width={screens.xs ? '100%' : 400}
      >
        <Button danger onClick={clearCart} style={{ marginBottom: 16 }}>Clear All</Button>
        {/* หัวตาราง */}
        <div style={{ display: 'flex', fontWeight: 'bold', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>Item</div>
          <div style={{ flex: 1, textAlign: 'left' }}>Qty</div>
          <div style={{ flex: 1, textAlign: 'right' }}>Price</div>
        </div>

        {cart.length === 0 ? (
          <p style={{textAlign:'center', marginTop:'20px'}}>No order</p>
        ) : (
          <>
            {cart.map((item) => {
              const price = item.cardmarket?.prices?.averageSellPrice || 0;
              const total = price * item.quantity;
              return (
                <div key={item.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 }}>
                                 
                  {/* ข้อมูลสินค้า */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'left' }}>
                      <img src={item.images.small} alt={item.name} style={{ width: 60, marginRight: 8 }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <div><strong>{item.name}</strong></div>
                        <div style={{ fontSize: 12, color: '#888' }}> ${price.toFixed(2)}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <strong>${total.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* เพิ่มลดจำนวน */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <Button
                        icon={<MinusOutlined />}
                        onClick={() => updateQuantity(item.id, -1)}
                        size="big"
                        disabled={item.quantity <= 0} // ป้องกันติดลบ ถ้าไม่อยากให้ติดลบ
                      />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => updateQuantity(item.id, 1)}
                        size="big"
                      />
                    </div>
                  </div>

                </div>
              );
            })}
            <Row gutter={[16,16]} align="middle" justify="space-between" style={{ marginTop: 30 , marginBottom: 16 }}wrap>
              <p><strong>Total card amount: </strong></p>
              <p><strong>{totalItems}</strong></p>
            </Row>
            <Row gutter={[16,16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}wrap>
              <p><strong>Total price: </strong></p>
              <p><strong>${totalPrice.toFixed(2)}</strong></p>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Button type="primary">CONTINUE TO PAYMENT</Button>      
            </div>    
          </>
        )}
      </Drawer>
    </div>
  );
}