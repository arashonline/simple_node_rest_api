exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'test',
            content: 'some content',
            imageUrl: 'images/kitkat.jpg',
            creator: {
                name:'Arash Rabiee',
            },
            createdAt: new Date()
        }]
    });
}

exports.createPost = (req, res, next) => {

    const title = req.body.title;
    const content = req.body.content;
    // create post in db
    res.status(201).json({
        message: 'Created!',
        post: {
            id: new Date().toISOString(), title: title, content: content
        }
    })
}