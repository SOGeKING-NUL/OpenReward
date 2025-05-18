import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
    }, 
    name: {
        type: String,
        required: true
    }, 
    username: {
        type: String,
        required: true,
        unique: true,
    }, 
    profilePicture: {
        type: String,
        default: null
    }, 
    bio: {
        type: String,
        default: null
    }, 

    githubUsername: {
        type: String,
        index: true,
        sparse: true
    }, 
    githubId: {
        type: String,
        index: true,
        sparse: true
    }, 
    githubConnected: {
        type: Boolean,
        default: false
    },
    githubAccessToken: {
        type: String,
        select: false
    }, 
    githubRefreshToken: {
        type: String,
        select: false
    }, 
    githubTokenIV: {
        type: String,
        select: false
    }, 
    githubTokenExpiry: {
        type: Date
    }, 
    joinedDate: {
        type: Date,
        default: Date.now
    }, 
}, {
    timestamps: true, 
    discriminatorKey: 'userType', 
});

// Base-model
export const User = mongoose.models.User || mongoose.model('User', userSchema);

const BountyHunterSchema= new Schema({
    skills: {
        type: [String],
        default: []
    }, 
    bountiesParticipatedIn: {
        type: [String],
        default: []
    }, 
    bountiesWon: {
        type: [String],
        default: []
    }, 
    totalAmountWon: {
        type: Number,
        default: 0
    }, 
    activeBountySubmissions: {
        type: [String],
        default: []
    }, 
});

const BountyProviderSchema =new Schema({
    organizationName: {
        type: String,
        default: null
    }, 
    organizationId: {
        type: String,
        default: null
    },
    organizationVerified: {
        type: Boolean,
        default: false
    }, 
    verificationDate: {
        type: Date,
        default: null
    }, 
    organizationWebsite: {
        type: String,
        default: null
    }, 
    userRoleInOrganization: {
        type: String,
        default: null
    }, 
    repositories: {
        type: [{
            name: String,        
            url: String,          
        }],
        default: []
    }, 
    bountiesListed: {
    type: Number,
    default: 0
    },
    totalAmountDistributed: {
        type: Number,
        default: 0
    }, 
});

export const BountyHunter = mongoose.models.BountyHunter || User.discriminator('BountyHunter', BountyHunterSchema);
export const BountyProvider = mongoose.models.BountyProvider || User.discriminator('BountyProvider', BountyProviderSchema);