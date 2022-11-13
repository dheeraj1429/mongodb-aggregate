// { $map: { input: <expression>, as: <string>, in: <expression> } }
// loop over the array and then perform the opration.
db.getCollection('pr').aggregate([
   {
      $project: {
         examScores: 1,
         examScore: {
            $map: {
               input: '$examScores.score',
               as: 'item',
               in: {
                  $multiply: ['$$item', 2],
               },
            },
         },
      },
   },
]);
