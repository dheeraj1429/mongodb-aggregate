// https://mongoing.com/docs/reference/operator/aggregation-pipeline.html

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

// db.pr.aggregate([{ $project: { firstElm: { $arrayElemAt: ['$hobbies', -1] } } }]);
