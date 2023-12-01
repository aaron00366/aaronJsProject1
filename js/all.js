const productList = document.querySelector('.productWrap')
const productSelect = document.querySelector('.productSelect')
const cartList = document.querySelector('.shoppingCart-tableList')
let productData = []
let cartData = []
function init(){
    getProductList();
    getCartList();
}
init();
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res) =>{
        productData = res.data.products
        console.log(productData);
        renderProduct()
    })
    .catch((err) =>{
        console.log(err);
    })
}

function renderProduct(){
    let str = ''
    productData.forEach(item => {
        str += combineProductHTMLItem(item)
    });
    productList.innerHTML = str
}
productSelect.addEventListener('change',function(e){
    const category = e.target.value
    if(category == '全部'){
        getProductList()
        return
    }
    let str = "";
    productData.forEach((item) =>{
        if(item.category == category){
            str += combineProductHTMLItem(item)
        }
    })
    productList.innerHTML = str
})
function combineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`
}

productList.addEventListener('click',function(e){
    e.preventDefault()
    let addCartClass = e.target.getAttribute('class')
    if(addCartClass !== 'js-addCart'){
        return
    }
    let productId = e.target.getAttribute('data-id')
    console.log(productId)
    let numCheck = 1
    
    cartData.forEach(item =>{
        if(item.product.id === productId){
            numCheck = item.quantity += 1
        }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
            }
    })
    .then((res)=>{
        alert('加入購物車')
        getCartList()
    })
    .catch((err) =>{
        console.log(err);
    })
})

//取得購物車list
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res) =>{
        cartData = res.data.carts
        console.log()
        document.querySelector('.js-total').textContent = toThousands(res.data.finalTotal)
        // console.log(cartData);
        let str = "";
        cartData.forEach(function(item){
            str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
        })
        cartList.innerHTML = str
    })
    .catch((err) =>{
        console.log(err);
    })
}
cartList.addEventListener('click',function(e){
    e.preventDefault()
    const cartId = e.target.getAttribute('data-id')
    if(cartId == null){
        alert('你點到別的東西了喔')
        return
    }
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(res =>{
        alert('刪除購物車成功!')
        getCartList()
    })
})

//刪除全部購物車品項
const discardAllBtn = document.querySelector('.discardAllBtn')
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault()
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(res =>{
        alert('刪除全部購物車成功')
        getCartList()
    })
    .catch((err) =>{
        alert('購物車已清空，請勿重複點擊')
    })
})

const orderInfoBtn = document.querySelector('.orderInfo-btn')
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault()
    if(cartData.length == 0){
        alert('請加入購物車')
    }
    const customerName = document.querySelector('#customerName').value
    const customerPhone = document.querySelector('#customerPhone').value
    const customerEmail = document.querySelector('#customerEmail').value
    const customerAddress = document.querySelector('#customerAddress').value
    const tradeWay = document.querySelector('#tradeWay').value
    if(customerName=='' || customerPhone==''|| customerEmail==''|| customerAddress==''|| tradeWay==''){
        alert('請勿輸入空資訊')
        return
    }
    if(validateEmail(customerEmail) == false){
        alert('請填寫正確Email格式');
        return;
    }
    const data = {
        "data": {
            "user": {
            "name": customerName,
            "tel": customerPhone,
            "email": customerEmail,
            "address": customerAddress,
            "payment": tradeWay
            }
        }
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,data)
    .then((res) =>{
        alert('訂單建立成功')
        getCartList()
        document.querySelector('#customerName').value = ''
        document.querySelector('#customerPhone').value = ''
        document.querySelector('#customerEmail').value = ''
        document.querySelector('#customerAddress').value = ''
        document.querySelector('#tradeWay').value = 'ATM'
    })
})

const customerEmail = document.querySelector('#customerEmail')
customerEmail.addEventListener('blur',function(e){
    if(validateEmail(customerEmail.value) == false){
        document.querySelector(`[data-message=Email]`).textContent = '請選擇正確的Email格式'
        return;
    }
})
//util.js
function toThousands(x) {
    let parts = x.toString().split('.')
    parts[0] =  parts[0].replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.')
    } 

function validateEmail(mail) 
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
    return true
    }
    return false
}
function validatePhone(phone) 
{
    if (/^09\d{2}-?\d{3}-?\d{3}$/.test(phone))
    {
    return true
    }
    return false
}    