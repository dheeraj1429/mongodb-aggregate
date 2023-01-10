//db.getCollection("groups").find({})
db.getCollection('groups').aggregate([
    {
        $match:
            { _id: ObjectId('639eab80065ae1dbfb5c0ef0') }
    },
    {
         $project: {
            _id: 1,
            groupName: 1,
            groupMessages: 1,
            totalMessagesDocuments: { $size: "$groupMessages" },
         },
      },
      { $unwind: "$groupMessages" },
      {
         $lookup: {
            from: "auths",
            localField: "groupMessages.userId",
            foreignField: "_id",
            as: "groupMessages.userInfo",
         },
      },
      {
         $project: {
            _id: 1,
            groupName: 1,
            totalMessagesDocuments: 1,
            totalPages: {$abs: {$ceil: {$divide: ['$totalMessagesDocuments', 4] }}},
            "groupMessages.userId": 1,
            "groupMessages.message": 1,
            "groupMessages._id": 1,
            "groupMessages.createdAt": 1,
            "groupMessages.userInfo._id": 1,
            "groupMessages.userInfo.name": 1,
            "groupMessages.userInfo.profilePic": "$groupMessages.userInfo.userProfile",
         },
      },
      {
         $project: {
            _id: 1,
            groupName: 1,
            totalMessagesDocuments: 1,
            totalPages: 1,
            "groupMessages.userId": 1,
            "groupMessages.message": 1,
            "groupMessages._id": 1,
            "groupMessages.createdAt": 1,
            "groupMessages.userInfo": { $arrayElemAt: ["$groupMessages.userInfo", 0] },
         },
      },
      { $sort: { "groupMessages.createdAt": -1 } },
      { $skip: 1 * 2 },
      { $limit: 2 },
      { $sort: { "groupMessages.createdAt": 1 } },
      {
         $group: {
            _id: {
               _id: "$_id",
               groupName: "$groupName",
               'totalMessagesDocuments': '$totalMessagesDocuments',
               totalPages: '$totalPages',
            },
            groupMessages: { $push: "$groupMessages" },
         },
      },
   ]);


/*
{
    groupId: '639dff4a7dc22e9da23089d6', 
    userInfo: {
        name: "aman"
        profilePic: "darktopia-QZRlh372pDI-unsplash.jpg"
        _id: "639de093344c5f8c7b4f87a7"
    }, 
    message: 'hello sir', 
    _sender_message_id: '0ca1c633-dbf8-4f70-91a2-c56a29a3c52f'
    }
*/



