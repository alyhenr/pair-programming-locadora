import moviesRepository from "repositories/movies-repository";
import rentalsRepository from "repositories/rentals-repository";
import usersRepository from "repositories/users-repository";
import rentalsService from "services/rentals-service";

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("getRentals", () => {
  it("should return the rentals", async () => {
    const mock = jest.spyOn(rentalsRepository, "getRentals");
    mock.mockImplementationOnce((): any => {
      return [
        {
          id: 1,
          date: new Date(),
          endDate: new Date(),
          userId: 1,
          movies: [],
          closed: false,
        },
      ];
    });

    expect(await rentalsService.getRentals()).toEqual([
      {
        id: 1,
        date: expect.any(Date),
        endDate: expect.any(Date),
        userId: 1,
        movies: [],
        closed: false,
      },
    ]);
  });
});

describe("getRentalById", () => {
  it("should return the rental with the given id", async () => {
    const mock = jest.spyOn(rentalsRepository, "getRentalById");
    mock.mockImplementationOnce((id): any => {
      if (id === 2) return null;
      return {
        id,
        date: new Date(),
        endDate: new Date(),
        userId: 1,
        movies: [],
        closed: false,
      };
    });

    expect(await rentalsService.getRentalById(1)).toEqual({
      id: 1,
      date: expect.any(Date),
      endDate: expect.any(Date),
      userId: 1,
      movies: [],
      closed: false,
    });
  });

  it("Should throw a not found error (404) when given id is not found", async () => {
    const mock = jest.spyOn(rentalsRepository, "getRentalById");
    mock.mockImplementationOnce((id): any => {
      if (id === 2) return null;
      return {
        id,
        date: new Date(),
        endDate: new Date(),
        userId: 1,
        movies: [],
        closed: false,
      };
    });
    const response = rentalsService.getRentalById(2);

    expect(response).rejects.toEqual({
      name: "NotFoundError",
      message: "Rental not found.",
    });
  });
});

describe("createRental", () => {
  it("Should create a rental, and return it", async () => {
    const mock = jest.spyOn(rentalsRepository, "createRental");
    const getUserMock = jest.spyOn(usersRepository, "getById");
    const getMovieMock = jest.spyOn(moviesRepository, "getById");
    const getUserRentals = jest.spyOn(rentalsRepository, "getRentalsByUserId");

    mock.mockImplementationOnce((rental): any => {
      return { id: 1, ...rental };
    });

    getUserMock.mockImplementationOnce((id: number): any => {
      return {
        id,
        firstName: "Joao",
        lastName: "123",
        email: "joao@gmail.com",
        cpf: "783126712",
        birthDate: new Date(),
      };
    });

    getMovieMock.mockImplementationOnce((movieId): any => [
      {
        id: movieId,
        name: "Joao",
        adultsOnly: false,
      },
    ]);

    getUserRentals.mockImplementationOnce((userId, closed): any => []);

    expect(
      await rentalsService.createRental({ userId: 1, moviesId: [1] })
    ).toEqual({
      id: 1,
      userId: 1,
      moviesId: [1],
    });
  });

  it("Should throw a not found error when user does not exist", async () => {
    const mock = jest.spyOn(rentalsRepository, "createRental");
    const getUserMock = jest.spyOn(usersRepository, "getById");
    const getMovieMock = jest.spyOn(moviesRepository, "getById");
    const getUserRentals = jest.spyOn(rentalsRepository, "getRentalsByUserId");

    mock.mockImplementationOnce((rental): any => {
      return { id: 1, ...rental };
    });

    getUserMock.mockImplementationOnce((id: number): any => {
      return null;
    });

    getMovieMock.mockImplementationOnce((movieId): any => [
      {
        id: movieId,
        name: "Joao",
        adultsOnly: false,
      },
    ]);

    getUserRentals.mockImplementationOnce((userId, closed): any => []);

    expect(
      rentalsService.createRental({ userId: 1, moviesId: [] })
    ).rejects.toEqual({
      name: "NotFoundError",
      message: "User not found.",
    });
  });

  it("Should throw an error when user already have open rentals", async () => {
    const mock = jest.spyOn(rentalsRepository, "createRental");
    const getUserMock = jest.spyOn(usersRepository, "getById");
    const getMovieMock = jest.spyOn(moviesRepository, "getById");
    const getUserRentals = jest.spyOn(rentalsRepository, "getRentalsByUserId");

    mock.mockImplementationOnce((rental): any => {
      return { id: 1, ...rental };
    });

    getUserMock.mockImplementationOnce((id: number): any => {
      return {
        id,
        firstName: "Joao",
        lastName: "123",
        email: "joao@gmail.com",
        cpf: "783126712",
        birthDate: new Date(),
      };
    });

    getMovieMock.mockImplementationOnce((movieId): any => [
      {
        id: movieId,
        name: "Joao",
        adultsOnly: false,
      },
    ]);

    getUserRentals.mockImplementationOnce((userId, closed): any => [1, 2, 3]);

    expect(
      rentalsService.createRental({ userId: 1, moviesId: [1] })
    ).rejects.toEqual({
      name: "PendentRentalError",
      message: "The user already have a rental!",
    });
  });
});
