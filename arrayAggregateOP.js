// 1 - $arrayElemAt => { $arrayElemAt: [ <array>, <index>] } }
db.pr.aggregate([{ $project: { firstElm: { $arrayElemAt: ['$hobbies', -1] } } }]); // return last elements from the array
db.pr.aggregate([{ $project: { firstElm: { $arrayElemAt: ['$hobbies', 1] } } }]); // return first elements from the array

// 2 - $concatArrays => { $concatArrays: [ <array1>, <array2>, ... ] }
db.pr.aggregate([
   { $project: { concatAr: { $concatArrays: ['$hobbies', '$examScores'] } } },
]);
db.pr.aggregate([
   {
      $project: {
         firstElm: { $slice: ['$hobbies', 1, 2] },
         secondELem: { $slice: ['$examScores', 0, 1] },
      },
   },
   {
      $project: {
         firstElm: 1,
         secondELem: 1,
         dataConcat: { $concatArrays: ['$firstElm', '$secondELem'] },
      },
   },
]);

// 3 - $filter => { $filter: { input: <array>, as: <string>, cond: <expression> } }
db.pr.aggregate([
   {
      $project: {
         arrayFilter: {
            $filter: {
               input: '$examScores',
               as: 'i',
               cond: { $and: [{ $gt: ['$$i.score', 70] }, { $lt: ['$$i.score', 80] }] },
            },
         },
      },
   },
]);

// 4 - $indexOfArray => { $indexOfArray: [ <array expression>, <search expression>, <start>, <end> ] }
db.pr.aggregate([
   { $project: { arraySearchElm: { $indexOfArray: ['$hobbies', 'Cooking'] } } },
]);

db.pr.aggregate([
   {
      $project: {
         hobbies: 1,
         properStr: {
            $concat: [
               { $toUpper: { $substr: ['cooking', 0, 1] } },
               { $toLower: { $substr: ['cooking', 1, { $strLenCP: 'cooking' }] } },
            ],
         },
      },
   },
   {
      $project: {
         properStr: 1,
         findArrayElmIndex: { $indexOfArray: ['$hobbies', '$properStr'] },
      },
   },
]);

// $isArray => { $isArray: [ <expression> ] } return true and false

// $range => { $range: [ <start>, <end>, <non-zero step> ] } => start = number 0, 1,... end last int number, non-zero step => steps numbers
db.pr.aggregate([{ $project: { input: { $range: [0, 10, 1] } } }]);

db.pr.aggregate([
   { $project: { examScores: 1 } },
   { $unwind: '$examScores' },
   {
      $project: {
         scoreElm: {
            $range: [
               0,
               {
                  $convert: {
                     input: '$examScores.score',
                     to: 'int',
                     onError: 10,
                     onNull: 10,
                  },
               },
               1,
            ],
         },
      },
   },
]);

// $reverseArray => { $reverseArray: <array expression> }

// $reduce => { $reduce: {  input: <array>, initialValue: <expression>, in: <expression> } }

// question 1 - find the all product documents which contains the salePrice filed and then sort all the products by salePrice -1
db.products
   .aggregate([
      { $match: { salePrice: { $exists: true } } },
      { $project: { _id: 1, name: 1, price: 1, salePrice: 1 } },
      { $sort: { salePrice: 1 } },
   ])
   .pretty();
