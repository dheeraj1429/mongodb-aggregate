db.getCollection("orders").aggregate([
    { $unwind: '$orderItems' },
    {
        $lookup: {
            from: 'products',
            localField: 'orderItems.parentProductId',
            foreignField: '_id',
            as: 'orderItems.productInformation',
        },
    },
    {
        $project: {
            _id: 1,
            userId: 1,
            'orderItems.productId': 1,
            'orderItems.price': 1,
            'orderItems.salePrice': 1,
            'orderItems.qty': 1,
            'orderItems.parentProductId': 1,
            'orderItems.subVariation': 1,
            "orderItems._id": 1,
            'orderItems.item': {
                $cond: {
                    if: { $eq: ['$orderItems.subVariation', true] },
                    then: {
                     $arrayElemAt: [
                        '$orderItems.productInformation.variations',
                        {
                           $indexOfArray: ['$orderItems.productInformation.variations._id', '$orderItems.productId'],
                        },
                     ],
                  },
                    else: { $arrayElemAt: ['$orderItems.productInformation', 0] }
                }
            },
            paymentMethod: 1,
            deliveryAddress: 1,
            currencyName: 1,
            countryCode: 1,
            currencySymbol: 1,
            orderStatus: 1,
            paymentStatus: 1,
            orderCreateAt: 1,
        }
    }
]);