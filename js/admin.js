let orderData = [];
const orderList = document.querySelector('.js-orderList')
function init(){
    getOrderList()
}
init()

function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            authorization:token
        }
    })
    .then(res =>{
        orderData = res.data.orders
        console.log(orderData);
        
        let str = ''
        orderData.forEach(item => {
            //產品組字串
            let productStr = ''
            item.products.forEach(function(productItem){
                productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`
            })
            //組時間字串
            const timeStamp = new Date(item.createdAt * 1000)
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()}/${timeStamp.getDate()}`
            
            //判斷訂單處理狀態
            let orderStatus = ''
            if(item.paid == true){
                orderStatus = '以處理'
            }else{
                orderStatus = '未處理'
            }
            //組訂單字串
            str +=`<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
            ${productStr}
            </td>
            <td>${orderTime}</td>
            <td class="orderStatus">
                <a href="#" class="js-orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        });
        orderList.innerHTML = str
        renderC3()
    })
}

orderList.addEventListener('click',function(e){
    e.preventDefault()
    const targetClass = e.target.getAttribute('class')
    let id = e.target.getAttribute('data-id')
    if(targetClass == 'delSingleOrder-Btn js-orderDelete'){
        deleteOrderItem(id)
        return
    }
    if(targetClass == 'js-orderStatus'){
        let status = e.target.getAttribute('data-status')
        changeOrderStatus(status,id)
        return
    }
})

function changeOrderStatus(status,id){
    let newStatue;
    if(newStatue == true){
        newStatue = false
    }else{
        newStatue = true
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,
    {
        "data": {
            "id": id,
            "paid": newStatue
        }
    },
    {
        headers:{
            authorization:token
        }
    })
    .then((res) =>{
        alert('修改訂單成功')
        getOrderList()
    })
}

function deleteOrderItem(id){
    console.log(id);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
    {
        headers:{
            authorization:token
        }
    })
    .then(res =>{
        alert('刪除訂單成功')
        getOrderList()
    })
}

const discardAllBtn = document.querySelector('.discardAllBtn')
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault()
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,
    {
        headers:{
            authorization:token
        }
    })
    .then(res =>{
        alert('刪除全部訂單成功')
        getOrderList()
    })
})
function renderC3(){
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.title] == undefined){
                total[productItem.title] = productItem.price * productItem.quantity
            }else{
                total[productItem.title] += productItem.price * productItem.quantity
            }
        })
    })

    //做出資料關聯
    let originAry = Object.keys(total)
    let rankSortAry = []
    originAry.forEach(item =>{
        let arr = []
        arr.push(item)
        arr.push(total[item])
        rankSortAry.push(arr)
    })
    rankSortAry.sort(function(a,b){
        return b[1] - a[1]
    })
    //如果筆數超過4筆以上，就統整為'其他'
    if(rankSortAry.length > 3){
        let otherTotal = 0
        rankSortAry.forEach(function(item,index){
            if(index > 2){
                otherTotal += rankSortAry[index][1]
            }
        })
        rankSortAry.splice(3,rankSortAry.length - 1);
        // console.log(otherTotal)
        rankSortAry.push(['others',otherTotal])
    }
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
            // colors:{
            //     "Louvre 雙人床架":"#DACBFF",
            //     "Antony 雙人床架":"#9D7FEA",
            //     "Anty 雙人床架": "#5434A7",
            //     "其他": "#301E5F",
            // }
        },
    });
    console.log(rankSortAry);
}