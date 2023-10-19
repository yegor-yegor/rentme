import React from "react";
import { Await, defer, useLoaderData } from "react-router-dom";
import { store } from "../../../app/store.ts";
import AsyncErrorPage from "../../../components/AsyncErrorPage.tsx";
import { Car } from "../../../types.ts";
import {
  getCarsByLocationInitiate,
  getCarsInitiate,
} from "features/api/apiSlice.ts";
import CarsGrid from "features/cars/CarsGrid.tsx";
import PayForFilter from "features/cars/PayForFilter.tsx";
import LocationFilter from "../LocationFilter/LocationFilter.tsx";

export async function loader({ request }: { request: any }) {
  const carsPromise = getCarsPromise();

  carsPromise.unsubscribe();
  return defer({
    carsPromise: carsPromise.unwrap(),
  });

  function getCarsPromise() {
    const searchParams = new URL(request.url).searchParams;
    const cityFilter = searchParams.get("city");
    const countryFilter = searchParams.get("country");

    if (cityFilter && countryFilter) {
      return store.dispatch(
        getCarsByLocationInitiate({
          city: cityFilter,
          country: countryFilter,
        }),
      );
    } else {
      return store.dispatch(getCarsInitiate());
    }
  }
}

export default function CarsPage() {
  const { carsPromise } = useLoaderData() as {
    carsPromise: Promise<Car[]>;
  };

  return (
    <main className="flex flex-col items-center" data-testid="cars-page">
      <React.Suspense
        fallback={<div data-testid="spinner">Loading 1234556...</div>}
      >
        <div className="my-4 flex justify-center items-center space-x-4 w-full">
          <LocationFilter />
          <PayForFilter />
        </div>
        <Await resolve={carsPromise} errorElement={<AsyncErrorPage />}>
          {(cars) => <CarsGrid cars={cars} />}
        </Await>
      </React.Suspense>
    </main>
  );
}
