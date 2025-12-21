"use client";

import { BrandCrud } from "@/features/brand/BrandCrud";
import { useEffect } from "react";
import {useBrandStore} from "@/store/brand.store";

const Page = () => {
  const { fetchBrands } = useBrandStore();

  useEffect(() => {
    fetchBrands({ page: 1, limit: 10 }); // обязательно передаём фильтр
  }, []);

  return <BrandCrud />;
};

export default Page;
