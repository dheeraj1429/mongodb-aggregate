db.orders.aggregate([
   { $unwind: '$orders' },
   {
      $lookup: {
         from: 'users',
         localField: 'userId',
         foreignField: '_id',
         as: 'userInformation',
      },
   },
   {
      $lookup: {
         from: 'products',
         localField: 'orders.productId',
         foreignField: '_id',
         as: 'orders.productInformation',
      },
   },
   { $unwind: '$orders.productInformation' },
   { $unwind: '$userInformation' },
   {
      $group: {
         _id: { _id: '$_id', userId: '$userId', userInformation: '$userInformation' },
         orders: { $push: '$orders' },
      },
   },
   {
      $project: {
         '_id._id': 1,
         '_id.userId': 1,
         '_id.userInformation.name': 1,
         '_id.userInformation.email': 1,
         '_id.userInformation.userProfileImage': 1,
         'orders.productId': 1,
         'orders.deliveryAddress': 1,
         'orders.productInformation._id': 1,
         'orders.productInformation.name': 1,
         'orders.productInformation.price': 1,
         'orders.productInformation.salePrice': 1,
         'orders.productInformation.productStatusInfo': 1,
         'orders.productInformation.productImage': 1,
      },
   },
]);

db.getCollection('pr').aggregate([
   { $unwind: '$examScores' },
   {
      $project: {
         name: 1,
         hobbies: 1,
         age: 1,
         examDifficulty: '$examScores.difficulty',
         examScore: '$examScores.score',
      },
   },
   {
      $group: {
         _id: {
            _id: '$_id',
            name: '$name',
            hoobies: '$hoobies',
            age: '$age',
         },
         examScores: { $push: { score: '$examScore', difficulty: '$examDifficulty' } },
      },
   },
]);

db.data.aggregate({
   $project: {
      name: 1,
      _id: 1,
      secondArrayElem: { $arrayElemAt: ['$favorites', 2] },
   },
});

db.persons.aggregate([{ $project: { _id: 1, myFirstFriend: { $arrayElemAt: ['$friends', 0] } } }]);

db.persons.aggregate([{ $project: { concatAr: { $concatArrays: ['$tags', '$friends'] } } }]);

db.pr
   .aggregate([
      {
         $project: {
            _id: 1,
            examScores: {
               $filter: {
                  input: '$examScores',
                  as: 'i',
                  cond: { $gte: ['$$i.score', 60] },
               },
            },
         },
      },
   ])
   .pretty();

db.pr.aggregate([
   {
      $project: {
         hobbiesIndexElem: { $indexOfArray: ['$hobbies', 'Cooking'] },
      },
   },
]);

db.pr.aggregate([
   {
      $project: {
         item: {
            $cond: {
               if: { $isArray: '$hobbies' },
               then: {
                  hobbiesIndexElem: { $indexOfArray: ['$hobbies', 'Cooking'] },
               },
               else: 'this is not the array',
            },
         },
      },
   },
]);

db.pr.aggregate([{ $project: { _id: 1, name: 1, items: { $range: [10, 0, -2] } } }]);

db.pr.aggregate([
   {
      $project: {
         _id: 1,
         name: 1,
         firstItem: { $slice: ['$examScores', 0, 1] },
      },
   },
   {
      $project: {
         _id: 1,
         name: 1,
         items: { $arrayElemAt: ['$firstItem', 0] },
      },
   },
   {
      $project: {
         _id: 1,
         name: 1,
         convertItm: {
            $convert: {
               input: '$items.score',
               to: 'int',
               onError: 0,
               onNull: 0,
            },
         },
      },
   },
   {
      $project: {
         name: 1,
         _id: 1,
         range: { $reverseArray: { $range: [0, '$convertItm', 10] } },
      },
   },
]);

db.persons.aggregate([
   {
      $project: {
         name: { $concat: ['$name.title', '-', '$name.first'] },
      },
   },
   {
      $project: {
         name: 1,
         splitStr: { $split: ['$name', '-'] },
         indexOfSubStr: {
            $indexOfCP: ['$name', 'e'],
         },
      },
   },
   {
      $project: {
         name: 1,
         _id: 0,
         splitStr: 1,
         stringSecondIdxValues: { $substr: [{ $arrayElemAt: ['$splitStr', 0] }, 1, 2] },
         comparetSplitStr: {
            $strcasecmp: [{ $arrayElemAt: ['$splitStr', 0] }, { $arrayElemAt: ['$splitStr', 1] }],
         },
      },
   },
]);

db.products
   .aggregate([
      {
         $bucket: {
            groupBy: '$price',
            boundaries: [1000, 2000, 3000, 4000, 5000, 6000],
            default: 'Other',
            output: {
               documents: { $sum: 1 },
               productsName: { $push: '$name' },
            },
         },
      },
   ])
   .pretty();

db.products
   .aggregate([
      {
         $bucketAuto: {
            groupBy: '$price',
            buckets: 5,
            output: {
               documents: { $sum: 1 },
               productsName: { $push: '$name' },
            },
         },
      },
   ])
   .pretty();

db.getCollection('pr').aggregate([
   { $unwind: '$examScores' },
   {
      $project: {
         name: 1,
         hobbies: 1,
         age: 1,
         examDifficulty: '$examScores.difficulty',
         examScore: '$examScores.score',
      },
   },
   {
      $group: {
         _id: {
            _id: '$_id',
            name: {
               $concat: [{ $toUpper: { $substr: ['$name', 0, 1] } }, { $toLower: { $substr: ['$name', 1, -1] } }],
            },
            hoobies: '$hobbies',
            age: '$age',
         },
         examScores: { $push: { score: '$examScore', difficulty: '$examDifficulty' } },
      },
   },
]);

db.getCollection('pr').aggregate([
   {
      $project: {
         examScores: 1,
         items: {
            $indexOfArray: [
               '$examScores',
               {
                  $arrayElemAt: [
                     {
                        $filter: {
                           input: '$examScores',
                           as: 'item',
                           cond: {
                              $eq: ['$$item.score', 62.1],
                           },
                        },
                     },
                     0,
                  ],
               },
            ],
         },
      },
   },
   {
      $project: {
         examScores: 1,
         items: 1,
         totalExamScore: {
            $reduce: {
               input: '$examScores.score',
               initialValue: { sum: 0 },
               in: {
                  sum: { $add: ['$$value.sum', '$$this'] },
               },
            },
         },
      },
   },
]);
