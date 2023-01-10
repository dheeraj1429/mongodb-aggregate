// Aggregation Pipeline Operators

// $project => Reshapes each document in the stream,such as by adding new fields or removing existing fields. For each input document, outputs one document.

db.getCollection('pr').aggregate([
   { $unwind: '$examScores' },
   {
      $group: {
         _id: {
            _id: '$_id',
            name: '$name',
            age: '$age',
         },
         scores: { $push: '$examScores.score' },
      },
   },
   {
      $project: {
         _id: 1,
         summery: {
            $switch: {
               branches: [
                  {
                     case: { $gte: [{ $avg: '$scores' }, 90] },
                     then: 'great job',
                  },
                  {
                     case: { $gte: [{ $avg: '$scores' }, 60] },
                     then: 'not bad',
                  },
                  {
                     case: { $gte: [{ $avg: '$scores' }, 40] },
                     then: 'too bad',
                  },
               ],
            },
         },
      },
   },
]);

// $match => Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage. $match uses standard MongoDB queries. For each input document, outputs either one document (a match) or zero documents (no match).
db.getCollection('pr').aggregate([
   {
      $match: {
         $and: [
            { _id: ObjectId('634bbdc9274fb1aff561a6fb') },
            {
               name: 'Max',
            },
         ],
      },
   },
]);

// $sample => Randomly selects the specified number of documents from its input.

// $out => Takes the documents returned by the aggregation pipeline and writes them to a specified collection. The $out operator must be the last stage in the pipeline. The $out operator lets the aggregation framework return result sets of any size.
db.getCollection('pr').aggregate([
   { $match: { hobbies: 'Cooking' } },
   { $project: { _id: 1, name: 1 } },
   { $out: 'rcData' }, // => collection name where we want to store the data into the new collection.
]);

// $bucket => Categorizes incoming documents into groups, called buckets, based on a specified expression and bucket boundaries.
db.getCollection('products').aggregate([
   {
      $bucket: {
         groupBy: '$price',
         boundaries: [100, 200, 300],
         default: 'others',
         output: { count: { $sum: 1 } },
      },
   },
]);

db.getCollection('products').aggregate([
   {
      $bucket: {
         groupBy: '$price',
         boundaries: [1000, 2000, 3000, 10000, 20000, 30000],
         default: 'others',
         output: {
            count: { $sum: 1 },
            items: {
               $push: {
                  name: '$name',
                  price: '$price',
                  discription: '$discription',
                  salePrice: '$salePrice',
               },
            },
         },
      },
   },
]);
