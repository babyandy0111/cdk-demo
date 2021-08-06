'use strict'
const https = require('https');
const querystring = require('querystring');
const crypto = require('crypto');
const hkey = "5294y06JbISpM5x9";
const hiv = "v77hoKGq4kWxNNIS";
// Main Lambda entry point
exports.handler = async (event) => {

    let Data = {
        MerchantID: "2000132",
        MerchantTradeNo: "ecPay1234",
        MerchantTradeDate: "2021/08/6 15:40:18",
        PaymentType: "aio",
        TotalAmount: 5000,
        TradeDesc: "andy test",
        ItemName: "xxxx 500#xxxx4500",
        ReturnURL: 'https://uzdnlaxtc3.execute-api.ap-southeast-1.amazonaws.com/prod/',
        ChoosePayment: "Credit",
        PeriodAmount: '50',
        PeriodType: 'M',
        Frequency: '1',
        ExecTimes: '2',
        PeriodReturnURL: 'http://192.168.0.1'
    };

    let chkmac = gen_chk_mac_value(Data);
    console.log(chkmac);

    Data['CheckMacValue'] = chkmac;
    let postData = querystring.stringify(Data);

    let options = {
        host: 'payment-stage.ecpay.com.tw',
        port: 443,
        method: 'POST',
        path: '/Cashier/AioCheckOut/V5',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    const promise = new Promise(function (resolve, reject) {
        https.request(options, (res) => {
            resolve(res.statusCode)
        }).on('error', (e) => {
            reject(Error(e))
        })
    })
    return promise
}

function gen_chk_mac_value(params, mode = 1) {
    if (params.constructor === Object) {
        // throw exception if param contains CheckMacValue, HashKey, HashIV
        let sec = ['CheckMacValue', 'HashKey', 'HashIV'];
        sec.forEach(function (pa) {
            if (Object.keys(params).includes(pa)) {
                throw new Error(`Parameters shouldn't contain ${pa}`);
            }
        });

        let od = {};
        let temp_arr = (Object.keys(params).sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }));
        // console.log(temp_arr);
        let raw = temp_arr.forEach(function (key) {
            od[key] = params[key];
        });
        raw = JSON.stringify(od).toLowerCase().replace(/":"/g, '=');
        raw = raw.replace(/","|{"|"}/g, '&');
        raw = urlencode_dot_net(`HashKey=${hkey}${raw}HashIV=${hiv}`);
        console.log(raw);

        let chksum = "";
        switch (mode) {
            case 0:
                chksum = crypto.createHash('md5').update(raw).digest('hex');
                break;
            case 1:
                chksum = crypto.createHash('sha256').update(raw).digest('hex');
                break;
            default:
                throw new Error("Unexpected hash mode.");
        }

        return chksum.toUpperCase();

    } else {
        throw new Error("Data received is not a Object.");
    }
}

function urlencode_dot_net(raw_data, case_tr = 'DOWN') {
    if (typeof raw_data === 'string') {
        let encode_data = encodeURIComponent(raw_data);
        switch (case_tr) {
            case 'KEEP':
                // Do nothing
                break;
            case 'UP':
                encode_data = encode_data.toUpperCase();
                break;
            case 'DOWN':
                encode_data = encode_data.toLowerCase();
                break;
        }
        encode_data = encode_data.replace(/\'/g, "%27");
        encode_data = encode_data.replace(/\~/g, "%7e");
        encode_data = encode_data.replace(/\%20/g, "+");
        return encode_data
    } else {
        throw new Error("Data received is not a string.");
    }
}
