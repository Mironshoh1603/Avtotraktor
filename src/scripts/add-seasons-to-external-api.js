const axios = require('axios');

const EXTERNAL_API = 'https://api.zakoapp.uz/api/v1';
const LOCAL_API = 'http://localhost:3003';

// External API ga login qilish
async function loginToExternalApi() {
  try {
    const response = await axios.post(`${EXTERNAL_API}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ External API ga muvaffaqiyatli login qilindi');
      return response.data.accessToken;
    }
  } catch (error) {
    console.error('❌ External API login xatolik:', error.response?.data || error.message);
    throw error;
  }
}

// Local kategoriyalarni olish
async function getLocalCategories() {
  try {
    const response = await axios.get(`${LOCAL_API}/categories`);
    console.log(`📋 ${response.data.length} ta kategoriya topildi`);
    return response.data;
  } catch (error) {
    console.error('❌ Local kategoriyalarni olishda xatolik:', error.message);
    throw error;
  }
}

// External API ga season qo'shish
async function addSeasonToExternal(token, category) {
  try {
    // Turli formatlarni sinab ko'ramiz
    const seasonData = {
      name: category.name,
      description: category.description || `${category.name} mavsumi`,
      status: category.status || 1,
      // Qo'shimcha maydonlar
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };

    console.log(`📤 ${category.name} ni qo'shish...`);
    
    const response = await axios.post(`${EXTERNAL_API}/admin/seasons`, seasonData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`✅ ${category.name} muvaffaqiyatli qo'shildi`);
      return response.data;
    } else {
      console.log(`⚠️  ${category.name} qo'shilmadi:`, response.data.message);
    }
  } catch (error) {
    console.error(`❌ ${category.name} qo'shishda xatolik:`, error.response?.data || error.message);
  }
}

// Asosiy funksiya
async function main() {
  try {
    console.log('🚀 Kategoriyalarni external API ga ko\'chirish boshlandi...\n');
    
    // 1. External API ga login
    const token = await loginToExternalApi();
    
    // 2. Local kategoriyalarni olish
    const categories = await getLocalCategories();
    
    // 3. Har bir kategoriyani external API ga qo'shish
    console.log('\n📤 Seasons qo\'shish jarayoni...');
    for (const category of categories) {
      await addSeasonToExternal(token, category);
      // API rate limit uchun kechikish
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 Barcha kategoriyalar ko\'chirildi!');
    
    // 4. Natijani tekshirish
    console.log('\n📊 Natijani tekshirish...');
    const finalCheck = await axios.get(`${EXTERNAL_API}/admin/seasons?limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ External API da ${finalCheck.data.data.length} ta season mavjud`);
    
  } catch (error) {
    console.error('💥 Umumi xatolik:', error.message);
  }
}

main();