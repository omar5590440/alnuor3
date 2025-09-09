// مصفوفة لتخزين المشتريات
let purchases = [];

// عناصر DOM
const productNameInput = document.getElementById('productName');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const dateInput = document.getElementById('date');
const addItemBtn = document.getElementById('addItem');
const purchasesList = document.getElementById('purchasesList');
const printBtn = document.getElementById('printBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput');
const noteInput = document.getElementById('note');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const notification = document.getElementById('notification');

// تعيين تاريخ اليوم كقيمة افتراضية
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

// إضافة عنصر إلى القائمة
addItemBtn.addEventListener('click', function() {
    const productName = productNameInput.value;
    const quantity = parseInt(quantityInput.value);
    const price = parseFloat(priceInput.value);
    const date = dateInput.value;
    const note = noteInput ? noteInput.value : '';
    
    if (!productName || isNaN(quantity) || isNaN(price) || !date) {
        alert('يرجى ملء جميع الحقول بشكل صحيح');
        return;
    }
    
    const total = quantity * price;
    const purchase = {
        productName,
        quantity,
        price,
        total,
        date,
        note
    };
    
    purchases.push(purchase);
    updatePurchasesList();
    clearForm();
    showNotification('تمت إضافة عملية الشراء بنجاح');
});

// البحث في المشتريات
if (searchInput) {
    searchInput.addEventListener('input', function() {
        updatePurchasesList();
    });
}

// تحديث قائمة المشتريات مع البحث والإجمالي
function updatePurchasesList() {
    purchasesList.innerHTML = '';
    let filteredPurchases = purchases;
    if (searchInput && searchInput.value.trim() !== '') {
        const q = searchInput.value.trim().toLowerCase();
        filteredPurchases = purchases.filter(p =>
            p.productName.toLowerCase().includes(q) ||
            p.date.includes(q) ||
            (p.note && p.note.toLowerCase().includes(q))
        );
    }
    let totalQuantity = 0;
    let totalAmount = 0;
    filteredPurchases.forEach((purchase, index) => {
        totalQuantity += purchase.quantity;
        totalAmount += purchase.total;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="editable" data-field="productName" data-index="${index}">${purchase.productName}</span></td>
            <td><span class="editable" data-field="quantity" data-index="${index}">${purchase.quantity}</span></td>
            <td><span class="editable" data-field="price" data-index="${index}">${purchase.price.toFixed(2)}</span></td>
            <td>${purchase.total.toFixed(2)}</td>
            <td><span class="editable" data-field="date" data-index="${index}">${purchase.date}</span></td>
            <td><span class="editable" data-field="note" data-index="${index}">${purchase.note || ''}</span></td>
            <td>
                <button class="btn" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        purchasesList.appendChild(row);
    });
    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
    enableEditing();
}

// التعديل المباشر على الجدول
function enableEditing() {
    document.querySelectorAll('.editable').forEach(span => {
        span.onclick = function() {
            if (span.querySelector('input')) return;
            const oldValue = span.textContent;
            const field = span.getAttribute('data-field');
            const index = parseInt(span.getAttribute('data-index'));
            const input = document.createElement('input');
            input.type = (field === 'quantity' || field === 'price') ? 'number' : 'text';
            input.value = oldValue;
            input.style.width = '80px';
            input.onblur = function() {
                let newValue = input.value;
                if (field === 'quantity') newValue = parseInt(newValue) || 0;
                if (field === 'price') newValue = parseFloat(newValue) || 0;
                purchases[index][field] = newValue;
                if (field === 'quantity' || field === 'price') {
                    purchases[index].total = purchases[index].quantity * purchases[index].price;
                }
                updatePurchasesList();
            };
            input.onkeydown = function(e) {
                if (e.key === 'Enter') input.blur();
            };
            span.textContent = '';
            span.appendChild(input);
            input.focus();
        };
    });
}

// مسح العنصر من القائمة
function removeItem(index) {
    purchases.splice(index, 1);
    updatePurchasesList();
    showNotification('تم حذف العملية بنجاح');
}

// مسح النموذج
function clearForm() {
    productNameInput.value = '';
    quantityInput.value = '';
    priceInput.value = '';
}

// طباعة الكشف
printBtn.addEventListener('click', function() {
    if (purchases.length === 0) {
        alert('لا توجد مشتريات لطباعتها');
        return;
    }
    
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    showNotification('تم إرسال الكشف للطباعة');
});

// الوضع الليلي
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
if (toggleDarkModeBtn) {
    // تفعيل الوضع الليلي افتراضيًا إذا لم يكن هناك تفضيل محفوظ
    if (localStorage.getItem('darkMode') === null) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    toggleDarkModeBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

// إعدادات الشركة وبيانات التواصل
const settingsForm = document.getElementById('settingsForm');
const companyNameInput = document.getElementById('companyName');
const contactInfoInput = document.getElementById('contactInfo');
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    if (companyNameInput && settings.companyName) companyNameInput.value = settings.companyName;
    if (contactInfoInput && settings.contactInfo) contactInfoInput.value = settings.contactInfo;
}
if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const settings = {
            companyName: companyNameInput.value,
            contactInfo: contactInfoInput.value
        };
        localStorage.setItem('settings', JSON.stringify(settings));
        showNotification('تم حفظ الإعدادات بنجاح');
    });
    loadSettings();
}

// إدارة المنتجات المقترحة
const addProductForm = document.getElementById('addProductForm');
const newProductNameInput = document.getElementById('newProductName');
const productsList = document.getElementById('productsList');
function loadProductsList() {
    const suggestions = JSON.parse(localStorage.getItem('productSuggestions') || '[]');
    if (!productsList) return;
    productsList.innerHTML = '';
    suggestions.forEach((name, idx) => {
        const li = document.createElement('li');
        li.style.marginBottom = '6px';
        li.innerHTML = `<span>${name}</span> <button class="btn" style="font-size:12px;padding:2px 8px;" onclick="removeProductSuggestion(${idx})">حذف</button>`;
        productsList.appendChild(li);
    });
}
window.removeProductSuggestion = function(idx) {
    let suggestions = JSON.parse(localStorage.getItem('productSuggestions') || '[]');
    suggestions.splice(idx, 1);
    localStorage.setItem('productSuggestions', JSON.stringify(suggestions));
    loadProductsList();
    loadProductSuggestions();
    showNotification('تم حذف المنتج من القائمة المقترحة');
};
if (addProductForm) {
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = newProductNameInput.value.trim();
        if (!name) return;
        let suggestions = JSON.parse(localStorage.getItem('productSuggestions') || '[]');
        if (!suggestions.includes(name)) {
            suggestions.push(name);
            localStorage.setItem('productSuggestions', JSON.stringify(suggestions));
            loadProductsList();
            loadProductSuggestions();
            showNotification('تمت إضافة المنتج للقائمة المقترحة');
        }
        newProductNameInput.value = '';
    });
    loadProductsList();
}

// تحديث اسم الشركة وبيانات التواصل في الطباعة
function generatePrintContent() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const companyName = settings.companyName || 'مقاول مساجد';
    const contactInfo = settings.contactInfo || '';
    const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    let content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>كشف المشتريات</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #fff;
                    color: #000;
                    margin: 0;
                    padding: 0;
                }
                .header {
                    text-align: center;
                    margin: 20px 0 10px 0;
                }
                .company-name {
                    font-size: 22px;
                    font-weight: bold;
                }
                .report-title {
                    font-size: 18px;
                    margin: 8px 0;
                }
                .date-label {
                    font-size: 15px;
                    color: #222;
                }
                .contact-info {
                    font-size: 14px;
                    color: #444;
                    margin-bottom: 8px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0 10px 0;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 6px 4px;
                    text-align: center;
                    font-size: 15px;
                }
                th {
                    background: #f2f2f2;
                    font-weight: bold;
                }
                .total-row {
                    font-weight: bold;
                    background: #eaeaea;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 13px;
                    color: #444;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">${companyName}</div>
                <div class="contact-info">${contactInfo}</div>
                <div class="report-title">كشف المشتريات</div>
                <div class="date-label">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>اسم المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                        <th>التاريخ</th>
                        <th>ملاحظات</th>
                    </tr>
                </thead>
                <tbody>
    `;
    purchases.forEach(purchase => {
        content += `
            <tr>
                <td>${purchase.productName}</td>
                <td>${purchase.quantity}</td>
                <td>${purchase.price.toFixed(2)}</td>
                <td>${purchase.total.toFixed(2)}</td>
                <td>${purchase.date}</td>
                <td>${purchase.note || ''}</td>
            </tr>
        `;
    });
    content += `
                    <tr class="total-row">
                        <td colspan="3">المجموع الكلي</td>
                        <td>${totalAmount.toFixed(2)} جنيه</td>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
                <p>نظام إدارة مشتريات مقاول المساجد</p>
            </div>
        </body>
        </html>
    `;
    return content;
}

// حفظ البيانات
saveBtn.addEventListener('click', function() {
    if (purchases.length === 0) {
        alert('لا توجد مشتريات لحفظها');
        return;
    }
    
    localStorage.setItem('purchases', JSON.stringify(purchases));
    showNotification('تم حفظ البيانات بنجاح');
});

// مسح الكل
clearBtn.addEventListener('click', function() {
    if (confirm('هل أنت متأكد من مسح جميع المشتريات؟')) {
        purchases = [];
        updatePurchasesList();
    }
});

// تحميل البيانات المحفوظة عند بدء التحميل
window.addEventListener('load', function() {
    const savedPurchases = localStorage.getItem('purchases');
    if (savedPurchases) {
        purchases = JSON.parse(savedPurchases);
        updatePurchasesList();
    }
});

// حفظ وعرض أسماء المنتجات المدخلة يدويًا
function loadProductSuggestions() {
    const suggestions = JSON.parse(localStorage.getItem('productSuggestions') || '[]');
    const datalist = document.getElementById('productSuggestions');
    if (!datalist) return;
    datalist.innerHTML = '';
    suggestions.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
    });
}

function saveProductName(name) {
    if (!name) return;
    let suggestions = JSON.parse(localStorage.getItem('productSuggestions') || '[]');
    if (!suggestions.includes(name)) {
        suggestions.push(name);
        localStorage.setItem('productSuggestions', JSON.stringify(suggestions));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadProductSuggestions();
    const addItemBtn = document.getElementById('addItem');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            const productName = document.getElementById('productName').value.trim();
            saveProductName(productName);
            loadProductSuggestions();
        });
    }
});

function showNotification(msg) {
    if (!notification) return;
    notification.textContent = msg;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 2000);
}

if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', function() {
        if (purchases.length === 0) {
            showNotification('لا توجد مشتريات للتصدير');
            return;
        }
        let csv = 'اسم المنتج,الكمية,السعر,المجموع,التاريخ,ملاحظات\n';
        purchases.forEach(p => {
            csv += `"${p.productName}",${p.quantity},${p.price},${p.total},"${p.date}","${p.note || ''}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'purchases.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('تم تصدير البيانات إلى Excel بنجاح');
    });
}
