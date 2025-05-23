import mongoose, {Schema} from 'mongoose';

const BountyHunterEntrySchema = new Schema({
  email: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  prRaised: {
    type: Boolean,
    default: false
  },
  prUrl: {
    type: String,
    default: null
  },
  prRaisedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['WORKING', 'SUBMITTED'],
    default: 'WORKING'
  }
});

BountyHunterEntrySchema.pre('save', function(next) {
  if (this.status === 'SUBMITTED') {
    if (!this.prRaised || !this.prUrl) {
      return next(new Error('PR URL is required when status is SUBMITTED'));
    }
    if (!this.prRaisedAt) {
      this.prRaisedAt = new Date();
    }
  }
  
  if (this.prRaised && this.status !== 'SUBMITTED') {
    this.status = 'SUBMITTED';
  }
  
  next();
});


const BountySchema = new Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bountyProvider: {
    type: String,
    required: true,
    index: true
  },
  bountyAmount: {
    type: Number,
    required: true
  },
  timeInterval: {
    type: Number,
    required: true
  },
  initialTimestamp: {
    type: Number,
    required: true
  },
  
  // Status information
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'COMPLETED', 'CLOSED', 'CANCELLED'],
    default: 'OPEN',
    index: true
  },
  
  bountyHunters: {
    type: [BountyHunterEntrySchema],
    default: []
  },
  bountyWinner: {
    type: String,
    default: null
  },
  
  issueURL: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});

const Bounty = mongoose.models.Bounty || mongoose.model('Bounty', BountySchema);

export default Bounty;
