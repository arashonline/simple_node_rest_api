const expect = require('chai').expect;
const authMiddleware = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

// we could nest any describe function together 
describe('Auth Middleware', function(){
    it('should throw an error if no authorization header is present', function(){
        const req = {
            get: function(headerName){
                return null;
            }
        };
        expect(authMiddleware.bind(this,req, {}, ()=>{})).to.throw('Not Authenticated.');
    })
    
    it('should throw an error if the authorization header is only one string', function(){
        const req = {
            get: function(headerName){
                return 'xyz ';
            }
        };
        // if no argument pass to throw() it looks for any Error
        expect(authMiddleware.bind(this,req, {}, ()=>{})).to.throw();
    })

    it('should throw an error if the token can not be verified', function(){
        const req = {
            get: function(headerName){
                return 'Bearer xyz';
            }
        };
        // if no argument pass to throw() it looks for any Error
        expect(authMiddleware.bind(this,req, {}, ()=>{})).to.throw();
    })

    it('should yield a userId after decoding the token', function(){
        const req = {
            get: function(headerName){
                return 'Bearer xyz';
            }
        };
        // jwt.verify = function(){
        //     return { userId: 'abcd'}
        // }
        sinon.stub(jwt,'verify')
        jwt.verify.returns( { userId: 'abcd'})
        authMiddleware(req, {}, ()=>{});
        // if no argument pass to throw() it looks for any Error
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId','abcd');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    })


});

