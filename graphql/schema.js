const {buildSchema} = require('graphql');

//  the ! mark make the query (in hello for instance) require
module.exports = buildSchema(`
    type TestData {
        text:String!
        views: Int!
    }

    type RootQuery {
        hello: TestData
    }

    schema {
        query: RootQuery
    }
`);