// https://mongoing.com/docs/reference/operator/aggregation-pipeline.html\
// https://mongoing.com/docs/reference/command/nav-aggregation.html
// https://mongoing.com/docs/reference/operator/aggregation.html

// mongodb aggrigation query with notes, and demos.

// db.pr.aggregate([{ $project: { firstElm: { $arrayElemAt: ['$hobbies', -1] } } }]);

// https://mongoing.com/docs/reference/operator/query.html
// Query and Projection Operators

// $eq	Matches values that are equal to a specified value.
db.pr.findOne({ name: { $eq: 'Max' } });
db.pr.findOne({ _id: '634bbdc9274fb1aff561a6fb', name: { $eq: 'Max' } });

// $gt	Matches values that are greater than a specified value.
db.pr.findOne({ age: { $gt: 20 } }); // return only one document with first match
db.pr.find({ age: { $gt: 20 } }); // return all document with match fields

// Matches all values that are not equal to a specified value.
db.pr.find({ age: { $ne: 29 } }).count();

// $in	Matches any of the values specified in an array.
db.pr.find({ hobbies: { $in: ['Cooking', 'Skiing'] } });
db.pr.find({ examScores: { $in: [{ difficulty: 3, score: 75.1 }] } }); // we need to query for the hole document. $in can't find the document in one fileds if docuemnt array contains more then one object fileds.
db.pr.find({ examScores: { $elemMatch: { difficulty: 3 } } }); // we can use the $elemMatch oprator.

// $nin	Matches none of the values specified in an array. => !$in

// Logical

// $or	Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
// { $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] } => || oprator
db.persons.find({ $or: [{ gender: { $eq: 'male' } }, { phone: '23138213' }] });
db.pr.find({
   $or: [
      { _id: ObjectId('634bbdc9274fb1aff561a6fc') },
      { _id: ObjectId('634bbdc9274fb1aff561a6fd') },
   ],
});

// $and	Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
// { $and: [ { <expression1> }, { <expression2> } , ... , { <expressionN> } ] } => && oprator
// $exists => check the fields is exists or not return boolean true and false.
db.inventory.find({ $and: [{ price: { $ne: 1.99 } }, { price: { $exists: true } }] });

// $nor	Joins query clauses with a logical NOR returns all documents that fail to match both clauses.
db.inventory.find({ $nor: [{ price: 1.99 }, { qty: { $lt: 20 } }, { sale: true }] });
/*
the price field value does not equal 1.99 and
the qty field value is not less than 20 and
the sale field value is not equal to true
*/

// Element
// $exists	Matches documents that have the specified field.
db.pr.find({ age: { $exists: true } }); // return all document where the age field is exists.

// $type	Selects documents if a field is of the specified type.
db.pr.find({ $and: [{ age: { $exists: true } }, { age: { $type: 'number' } }] }); // find document where age filed is exists and age field type is number.

// Evaluation
// $mod	Performs a modulo operation on the value of a field and selects documents with a specified result.
db.pr.find({ age: { $mod: [10, 0] } }); // return those document where the document fileds age devide by mod first elemet and return mod array second values like 30 / 10  => 3 like 3 * 10 == 30 - 30 = 0;
// $mod operator uses 0 as the remainder value, and if passed an array with more than two elements, the $mod ignores all but the first two elements. Previous versions do return an error when passed an empty array.

// $regex	Selects documents where values match a specified regular expression.
db.pr.find({ name: { $regex: /m/i } });
db.pr.updateOne(
   { _id: ObjectId('634bbdc9274fb1aff561a6fb') },
   { $push: { examScores: { name: 'dheeraj', age: 20 } } }
);
db.pr.find({ examScores: { $elemMatch: { name: { $regex: /d/i } } } }); // find the documents where the examScores field containt the object and inside the object the key 'name' hold the string where the string has 'd' letter.

// $text	Performs text search.
/*
{
  $text:
    {
      $search: <string>, => search the string by using the $serarch.
      $language: <string>, => if we want to find the string using language. like we want to find the text which is en language text.
      $caseSensitive: <boolean>, => by default $text search string in caseSensitive mean if we just find the text in upperCase then this query return the all document where the text is lowerCase or upperCase. we can set this to true or false.
      $diacriticSensitive: <boolean>
    }
}
*/
db.pr.createIndex({ name: 'text' }); // first we need to create a index for the $text oprations.
db.pr.find({ $text: { $search: 'Max' } });
db.pr.find({ $text: { $search: 'Max' } });
db.persons.createIndex({ 'location.state': 'text' });
db.persons.find({ $text: { $search: 'northern' } }); // this query return all the document loaction.state field contains the 'northern' string. If we just pass the 2 and 3 string to search then the $search search all the document
db.persons.find({ $text: { $search: 'northern state demo' } }); // => search by northern, search by state, search by demo.

// if we want to find the phrase string then we can user the "\"<String>\"" like this.
// db.persons.find({$text: {$search: "\"northern sav\""} })
// Prefixing a word with a hyphen-minus (-) negates a word:
db.persons.find({ $text: { $search: 'northern -savonia' } }).pretty(); // this query is not find those document which has this string. this query just remove the "savonia" string documents. and find only the 'northern' string documents.

// we can aslo use the filter options in the text. like we just find the document coofie and the shop. if the documents contains the same string so we want to srot those document top anothers document in order is second and thered.
// The returned document includes an additional field score that contains the document’s score associated with the text search.
db.persons
   .find({ $text: { $search: 'northern -savonia' } }, { score: { $meta: 'textScore' } })
   .sort({ score: { $meta: 'textScore' } })
   .pretty();

// $where	Matches documents that satisfy a JavaScript expression.
db.pr.find({ $where: 'this.age === 29' });
db.pr.find({
   $where: function () {
      return this.age === 29;
   },
});
db.persons.find({ gender: 'male', $where: 'this.dob.age === this.registered.age' });
db.persons.find({ gender: 'male', $where: 'this.dob.age === 59' });

// Array
// $all	Matches arrays that contain all elements specified in the query.
db.pr.find({ hobbies: { $all: ['Sports', 'Cooking'] } });
db.pr.find({ $and: [{ hobbies: 'Soprts' }, { hobbies: 'Cooking' }] }); // same

// NOTE =>
// if we just find the document which is inside the array then we want to pass to hold docuemnt into query then we get back the document.
db.pr.find({ examScores: { difficulty: 4, score: 57.9 } });
// if we pass obly some values to query document. then we get back the null or nothing.
db.pr.find({ examScores: { difficulty: 4 } }); // that time we can use $elemMatch oprator.
// ------

// $size	Selects documents if the array field is a specified size.
db.collection.find({ field: { $size: 2 } });

// Geospatial => not complete?
db.map.findOne();
// if we just query for the document which is near coordinates then we just get the error.
// if we want to find the near coordinates in mongodb document then first we want to crate a index for the location.
db.map.createIndex({ location: '2dsphere' }); // create a spacile index not line 1 or -1, not like 'text' it's a 2dsphere.

// $near	Returns geospatial objects in proximity to a point. Requires a geospatial index. The 2dsphere and 2d indexes support $near.

/*
{
  $near: {
     $geometry: {
        type: "Point" ,
        coordinates: [ <longitude> , <latitude> ]
     },
     $maxDistance: <distance in meters>,
     $minDistance: <distance in meters>
  }
}
*/
db.map
   .find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [77.205752, 28.613911] } } },
   })
   .pretty(); // its return all the documents which has location.coordinates fields.\
// $near return the object which has near coordinates. it's take a $geometry which is takes a object to find the coordinates.
// if we want to find the minDistance 30m maxDistance 1000m then we can use the $minDistance, $maxDistance
db.map.find({
   location: {
      $near: {
         $geometry: {
            type: 'Point',
            coordinates: [77.205752, 28.613911],
            $maxDistance: 10,
            $minDistance: 0,
         },
      },
   },
});

// ------------------------------------------------------
// Boolean Aggregation Operators

// $and => Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.

db.getCollection('pr').aggregate([
   {
      $match: {
         $and: [{ _id: ObjectId('634bbdc9274fb1aff561a6fb') }, { hobbies: 'Cooking' }],
      },
   },
]);

// $or => Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.

db.inventory.aggregate([
   {
      $project: {
         item: 1,
         result: { $or: [{ $gt: ['$qty', 250] }, { $lt: ['$qty', 200] }] },
      },
   },
]);

// $not => Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.

// Date Aggregation Operators

db.getCollection('products').aggregate([
   {
      $project: {
         year: { $year: '$createdAt' },
         month: { $month: '$createdAt' },
         day: { $dayOfMonth: '$createdAt' },
         hour: { $hour: '$createdAt' },
         minutes: { $minute: '$createdAt' },
         seconds: { $second: '$createdAt' },
         milliseconds: { $millisecond: '$createdAt' },
         dayOfYear: { $dayOfYear: '$createdAt' },
         dayOfWeek: { $dayOfWeek: '$createdAt' },
         week: { $week: '$createdAt' },
      },
   },
]);

// Conditional Aggregation Operators

// $cond => { $cond: { if: <boolean-expression>, then: <true-case>, else: <false-case-> } }
// If the <boolean-expression> evaluates to true, then $cond evaluates and returns the value of the <true-case> expression. Otherwise, $cond evaluates and returns the value of the <false-case> expression.
db.getCollection('pr').aggregate([
   {
      $project: {
         item: {
            $cond: {
               if: { $eq: ['$examScores.score', 57.9] },
               then: { $arrayElemAt: ['$examScores', 0] },
               else: { $arrayElemAt: ['$examScores', 1] },
            },
         },
      },
   },
]);

// $ifNull => { $ifNull: [ <expression>, <replacement-expression-if-null> ] }
db.inventory.aggregate([
   {
      $project: {
         item: 1,
         description: { $ifNull: ['$description', 'Unspecified'] },
      },
   },
]);

// => switch

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

// ------------------------------------------------------
