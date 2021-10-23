const request = require('supertest');
const app = require('../src/app');
const {
  connectDB,
  eraseDB
} = require('../src/db')

let db;

beforeAll(async () => {
  db = await connectDB();
});

afterEach(async () => {
  await eraseDB(db);
});

describe('User Tests', () => {
  let userID;
  let createdUser;
  let token;

  const user = {
    name: 'Example User',
    email: 'example@email.com',
    password: 'Password123'
  }

  beforeEach(async () => {
    const res = await request(app).post('/register').send(user)

    token = res.body.token;
    userID = res.body._id;
    createdUser = res.body
  })

  it('Register new user', async () => {
    const newUser = {
      name: 'Example User',
      email: 'example2@email.com',
      password: 'Password123'
    }

    const res = await request(app).post('/register').send(newUser)

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(newUser.name);
    expect(res.body.email).toBe(newUser.email);
    expect(res.body.password).toBe(undefined);
  });

  it('validation error on creating user', async () => {
    const res = await request(app).post('/register').send({})

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Could not create user');
  });

  it('Recieves error on creating user', async () => {
    const newUser = {
      name: 'Example User123',
      email: 'email',
      password: '1'
    }

    const res = await request(app).post('/register').send(newUser)

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Could not create user');
  });

  it('Recieves error on creating user', async () => {
    const res = await request(app).post('/register').send(user)
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Could not create user');
  });

  it('Update user', async () => {
    const updateUser = {
      _id: userID,
      name: 'Update User',
      email: 'new_email@email.com',
      password: 'NewPassword123'
    }

    const res = await request(app).put('/update').send(updateUser)
      .set('authorization', `JWT ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(updateUser.name);
    expect(res.body.email).toBe(updateUser.email);
    expect(res.body.password).toBe(undefined);
  });

  it('Error on updating with unauthorized user', async () => {
    const updateUser = {
      _id: userID,
      name: 'Update User',
      email: 'new_email@email.com',
      password: 'NewPassword123'
    }

    const res = await request(app).put('/update').send(updateUser)

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Unauthorized user!' );
  });

  it('Error on updating user with used email', async () => {
    const newUser = {
      name: 'Example User',
      email: 'example2@email.com',
      password: 'Password123'
    }

    const req = await request(app).post('/register').send(newUser)

    const updateUser = {
      ...user,
      _id: req.body._id
    }
    const res2 = await request(app).put('/update').send(updateUser)
      .set('authorization', `JWT ${token}`);

    expect(res2.statusCode).toBe(400);
    expect(res2.body.message).toBe('Could not update user');
  });

  it('Login user', async () => {
    const res = await request(app).post('/login').send(user)

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(user.name);
    expect(res.body.email).toBe(user.email);
    expect(res.body.password).toBe(undefined);
  });

  it('Failed login user wrong password', async () => {
    const failedUser = {
      email: 'example@email.com',
      password: 'Senha Errada'
    }
    const res = await request(app).post('/login').send(failedUser)

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authentication failed. Invalid user or password.');
  });

  it('Failed login, missing attributes', async () => {
    const failedUser = {
      email: 'example@email.com'
    }
    const res = await request(app).post('/login').send(failedUser)

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Could not login');
  });

  it('forgot password no user', async () => {
    const failedUser = {
      email: 'example@email.com'
    }
    const res = await request(app).post('/forgot_password').send(failedUser)

    expect(res.statusCode).toBe(422);
  });
});