// 1 - $arrayElemAt => { $arrayElemAt: [ <array>, <index>] } }
db.pr.aggregate([{ $project: { firstElm: { $arrayElemAt: ['$hobbies', -1] } } }]); // return last elements from the array
db.pr.aggregate([{ $project: { firstElm: { $arrayElemAt: ['$hobbies', 1] } } }]); // return first elements from the array

// 2 - $concatArrays => { $concatArrays: [ <array1>, <array2>, ... ] }
db.pr.aggregate([{ $project: { concatAr: { $concatArrays: ['$hobbies', '$examScores'] } } }]);
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
db.pr.aggregate([{ $project: { arraySearchElm: { $indexOfArray: ['$hobbies', 'Cooking'] } } }]);

db.pr.aggregate([
   {
      $project: {
         hobbies: 1,
         properStr: {
            $concat: [{ $toUpper: { $substr: ['cooking', 0, 1] } }, { $toLower: { $substr: ['cooking', 1, { $strLenCP: 'cooking' }] } }],
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

// $reverseArray => { $reverseArray: <array expression> } reverse the array.

// $reduce => { $reduce: {  input: <array>, initialValue: <expression>, in: <expression> } }

// $unwind => { $unwind: <field path> }
db.pr.aggregate([{ $unwind: '$examScores' }, { $group: { _id: { docId: '$_id' }, allScors: { $push: '$examScores.score' } } }]);

// question 1 - find the all product documents which contains the salePrice filed and then sort all the products by salePrice -1
db.products.aggregate([{ $match: { salePrice: { $exists: true } } }, { $project: { _id: 1, name: 1, price: 1, salePrice: 1 } }, { $sort: { salePrice: 1 } }]).pretty();

// Object values into the array;
db.persons.aggregate([
   {
      $project: {
         _id: 1,
         location: 1,
         birth: { $convert: { input: '$dob.date', to: 'date' } },
      },
   },
   {
      $project: {
         type: 'point',
         birth: 1,
         coordinates: [
            {
               $convert: {
                  input: '$location.coordinates.longitude',
                  to: 'double',
                  onError: 0,
                  onNull: 0,
               },
            },
            {
               $convert: {
                  input: '$location.coordinates.latitude',
                  to: 'double',
                  onError: 0,
                  onNull: 0,
               },
            },
         ],
      },
   },
   { $group: { _id: { birthYear: { $isoWeekYear: '$birth' } }, totalDoc: { $sum: 1 } } },
]);

// $push
db.persons
   .aggregate([
      {
         $group: {
            _id: { name: '$name' },
            allCoordinates: { $push: '$location.coordinates' },
         },
      },
   ])
   .pretty();

db.pr.aggregate([{ $sort: { 'examScore.score': 1 } }, { $project: { highest: { $slice: ['$examScores', 1] } } }]).pretty();

db.pr.aggregate([
   { $unwind: '$examScores' },
   { $project: { _id: 1, age: 1, name: 1, score: '$examScores.score' } },
   { $sort: { score: 1 } },
   {
      $group: {
         _id: '$_id',
         name: { $first: '$name' },
         age: { $first: '$age' },
         maxScore: { $max: '$score' },
      },
   },
]);

// bucket =>

/*
{
  $bucket: {
      groupBy: <expression>,
      boundaries: [ <lowerbound1>, <lowerbound2>, ... ],
      default: <literal>,
      output: {
         <output1>: { <$accumulator expression> },
         ...
         <outputN>: { <$accumulator expression> }
      }
   }
}
*/
