const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }
      console.log(args.userInput.password);
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw Error('User does not exist');
    }
    console.log(password);
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw Error('Invalid password');
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, 'key', { expiresIn: '1h' });
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 1
    };
  }
};
