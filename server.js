import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const ScoreBoard = new mongoose.Schema({
  Playername: {
    type: String,
    required: true,
  },
  Respect: {
    type: Number,
    default: null,
  },
  Time: {
    type: Number,
    default: null,
  },
});

const Board = mongoose.model('ScoreBoard', ScoreBoard);

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect('mongodb+srv://suhaibhussain1906:mongodb@cluster0.wcw7y.mongodb.net/Backend');
    console.log(`MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('MONGODB connection error:', error);
    process.exit(1);
  }
};

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

app.post('/add', async (req, res) => {
  try {
    const { Playername } = req.body;

    if (!Playername) {
      return res.status(400).json({ error: 'Playername is required.' });
    }

    const existingPlayer = await Board.findOne({ Playername });
    if (existingPlayer) {
      return res.status(400).json({ error: 'Player already exists.' });
    }

    const newPlayer = new Board({ Playername });
    await newPlayer.save();

    res.status(201).json({ message: 'Player added successfully!', player: newPlayer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player.', details: error.message });
  }
});

app.patch('/update-score', async (req, res) => {
    try {
      const { Playername, Respect, Time } = req.body;
  
      const updatedPlayer = await Board.findOneAndUpdate(
        { Playername },
        { $set: { Respect, Time } },
        { new: true }
      );
  
      if (!updatedPlayer) {
        return res.status(404).json({ error: 'Player not found.' });
      }
  
      res.status(200).json({ message: 'Score updated successfully!', player: updatedPlayer });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update score.', details: error.message });
    }
  });