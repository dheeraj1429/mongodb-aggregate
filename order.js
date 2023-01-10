//db.getCollection("orders").find({})
db.getCollection('orders').aggregate([
    { $match: { userId: ObjectId("636c94ab7c0a2ccbd1e6f4a7") } },
    { $unwind: "$orderItems" },
    {
        $lookup: {
            from: 'products',
            localField: 'orderItems.parentProductId',
            foreignField: '_id',
            as: 'orderItems.productInformation',
        },
    },
    { $unwind: "$orderItems.productInformation" },
    {
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userInformation',
        },
    },
    { $unwind: '$userInformation' },
    {
        $project: {
            _id: 1,
            userId: 1,
            'orderItems.productId': 1,
            'orderItems.price': 1,
            'orderItems.salePrice': 1,
            'orderItems.price': 1,
            'orderItems.parentProductId': 1,
            'orderItems.subVariation': 1,
            'orderItems.qty': 1,
            'orderItems._id': 1,
            'paymentMethod': 1,
            'deliveryAddress': 1,
            'currencyName': 1,
            'currencySymbol': 1,
             countryCode: 1,
            'orderStatus': 1,
            'paymentStatus': 1,
            'orderCreateAt': 1,
            'userInformation': 1,
            'orderItems.productInformation': 1,
            'orderItems.cartProduct': {
                $cond: {
                    if: { $eq: ['$orderItems.subVariation', true] },
                    then: {
                        $arrayElemAt:
                            ['$orderItems.productInformation.variations',
                                {
                                    $indexOfArray:
                                        ['$orderItems.productInformation.variations._id', '$orderItems.productId']
                                }]
                    },
                    else: "$orderItems.productInformation",
                }
            }
        }
    },
    {
        $group: {
            _id: {
                userId: "$userId",
                currencySymbol: '$currencySymbol',
                currencyName: '$currencyName',
                countryCode: '$countryCode',
                userInformation: '$userInformation',
            },
            orderItems: {
                $push: {
                    "orderPlaceDate": '$orderCreateAt',
                    "paymentStatus": '$paymentStatus',
                    "price": '$orderItems.price',
                    "salePrice": '$orderItems.salePrice',
                    "qty": '$orderItems.qty',
                     countryCode: '$countryCode',
                     'subVariation': '$orderItems.subVariation',
                     parentProductId: '$orderItems.parentProductId',
                    productInformation: {
                        _id: '$orderItems.cartProduct._id',
                        name: "$orderItems.cartProduct.name",
                        productImage: "$orderItems.cartProduct.productImage"
                    }
                }
            }
        }
    },
    {
        $project: {
            '_id.userId': 1,
            '_id.currencySymbol': 1,
            '_id.currencyName': 1,
            '_id.countryCode': 1,
            '_id.userInformation.name': 1,
            '_id.userInformation.email': 1,
            '_id.userInformation.userProfileImage': 1,
            "orderItems": 1
        }
    }
]);







