const clothData = {
    tradition:{
        worker:[],
        seller:[],
        officer:[
            "( <lora:AoDaiNam_V36_Locon:1>,aodainam,  flat clothes,asian)"
        ],
        default: {
            male:["( <lora:AoDaiNam_V36_Locon:1>,aodainam, flat clothes,asian)"
        ],
           female:[",(Hoi An background:1.2), (<lora:vietphuc:0.7>) beautiful young (woman (19yo)) in a pink ao_tac,ao_tac, wearing ao_tac,",
            // ",beautiful young (woman (19yo)) wearing <lora:aobaba02:1>,(Hoi An background:1.2),",
            // "( <lora:AoDaiNam_V36_Locon:1>,aodainam, flat clothes,asian)"
            // " , beautiful young (woman (19yo)) wearing aodai <lora:a0d4ivn:0.7>,(full-body shot )"
        ]
        }
            
    },
    modern: {
        worker:[
            ",wearing worker clothes,"
        ],
        seller:[
            ",wearing business clothes,vest, work, with suite, seller style, wear seller clothes,"
        ],
        officer:[
            ",wearing vest, elegant and polite,"
        ],
        default: [
            " ,wearing vest, with suite, elegant and polite, workplace clothes"
        ]
    }

};

module.exports = clothData;