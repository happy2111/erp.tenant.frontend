"use client";
import { useEffect } from "react";
import {useProductStore} from "@/store/product.store";
import {ProductCrud} from "@/features/product/ProductCrud";

const Page = () => {
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts({ page: 1, limit: 10 });
  }, []);

  return <ProductCrud />;
};

export default Page;
