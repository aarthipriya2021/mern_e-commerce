// --- AdminDashboard.jsx ---
import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AddIcon from "@mui/icons-material/Add";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ClearIcon from "@mui/icons-material/Clear";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { selectBrands } from "../../brands/BrandSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { ProductCard } from "../../products/components/ProductCard";
import {
  deleteProductByIdAsync,
  fetchProductsAsync,
  selectProductIsFilterOpen,
  selectProductTotalResults,
  selectProducts,
  toggleFilters,
  undeleteProductByIdAsync,
} from "../../products/ProductSlice";

import { ITEMS_PER_PAGE } from "../../../constants";

const sortOptions = [
  { name: "Price: low to high", sort: "price", order: "asc" },
  { name: "Price: high to low", sort: "price", order: "desc" },
];

export const AdminDashBoard = () => {
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({ brand: [], category: [] });
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);

  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const products = useSelector(selectProducts);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);
  const totalResults = useSelector(selectProductTotalResults);

  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is488 = useMediaQuery(theme.breakpoints.down(488));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is700 = useMediaQuery(theme.breakpoints.down(700));

  useEffect(() => {
    const finalFilters = {
      ...filters,
      pagination: { page, limit: ITEMS_PER_PAGE },
      sort,
    };
    dispatch(fetchProductsAsync(finalFilters));
  }, [filters, sort, page]);

  const handleBrandFilters = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    const current = [...filters.brand];

    const updated = checked ? [...current, value] : current.filter((id) => id !== value);
    setFilters({ ...filters, brand: updated });
  };

  const handleCategoryFilters = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    const current = [...filters.category];

    const updated = checked ? [...current, value] : current.filter((id) => id !== value);
    setFilters({ ...filters, category: updated });
  };

  const getCategoryIdByName = (name) => {
    const category = categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
    return category?._id;
  };

  const handleProductDelete = (productId) => {
    dispatch(deleteProductByIdAsync(productId));
  };

  const handleProductUnDelete = (productId) => {
    dispatch(undeleteProductByIdAsync(productId));
  };

  return (
    <>
      <motion.div
        style={{
          position: "fixed",
          backgroundColor: "white",
          height: "100vh",
          padding: "1rem",
          overflowY: "scroll",
          width: is500 ? "100vw" : "30rem",
          zIndex: 500,
        }}
        variants={{ show: { left: 0 }, hide: { left: -500 } }}
        initial="hide"
        transition={{ ease: "easeInOut", duration: 0.7, type: "spring" }}
        animate={isProductFilterOpen ? "show" : "hide"}
      >
        <Stack mb="5rem">
          <Typography variant="h4">New Arrivals</Typography>
          <IconButton onClick={() => dispatch(toggleFilters())} sx={{ position: "absolute", top: 15, right: 15 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ClearIcon fontSize="medium" />
            </motion.div>
          </IconButton>

          <Stack rowGap={2} mt={4}>
            {["Totes", "Backpacks", "Travel Bags", "Hip Bags", "Laptop Sleeves"].map((catName) => (
              <Typography
                key={catName}
                sx={{ cursor: "pointer" }}
                variant="body2"
                onClick={() => setFilters({ ...filters, category: [getCategoryIdByName(catName)] })}
              >
                {catName}
              </Typography>
            ))}
          </Stack>

          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}><Typography>Brands</Typography></AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {brands.map((brand) => (
                    <FormControlLabel
                      key={brand._id}
                      control={<Checkbox value={brand._id} checked={filters.brand.includes(brand._id)} onChange={handleBrandFilters} />}
                      label={brand.name}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}><Typography>Category</Typography></AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category._id}
                      control={<Checkbox value={category._id} checked={filters.category.includes(category._id)} onChange={handleCategoryFilters} />}
                      label={category.name}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </motion.div>

      <Stack rowGap={5} mt={is600 ? 2 : 5} mb={"3rem"}>
        <Stack flexDirection="row" justifyContent="flex-end" alignItems="center" columnGap={5} mr="2rem">
          <Stack width="12rem">
            <FormControl fullWidth>
              <InputLabel id="sort-dropdown">Sort</InputLabel>
              <Select
                variant="standard"
                labelId="sort-dropdown"
                label="Sort"
                onChange={(e) => setSort(e.target.value)}
                value={sort}
              >
                <MenuItem value={null}>Reset</MenuItem>
                {sortOptions.map((option) => (
                  <MenuItem key={option.name} value={option}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Grid container gap={2} justifyContent="center">
          {products.map((product) => (
            <Stack key={product._id}>
              <Stack sx={{ opacity: product.isDeleted ? 0.7 : 1 }}>
                <ProductCard
                  id={product._id}
                  title={product.title}
                  thumbnail={product.thumbnail}
                  brand={product.brand.name}
                  price={product.price}
                  isAdminCard={true}
                />
              </Stack>
              <Stack direction="row" spacing={2} px={2} alignSelf="flex-end">
                <Button component={Link} to={`/admin/product-update/${product._id}`} variant="contained">Update</Button>
                {product.isDeleted ? (
                  <Button onClick={() => handleProductUnDelete(product._id)} color="error" variant="outlined">Un-delete</Button>
                ) : (
                  <Button onClick={() => handleProductDelete(product._id)} color="error" variant="outlined">Delete</Button>
                )}
              </Stack>
            </Stack>
          ))}
        </Grid>

        <Stack alignSelf={is488 ? "center" : "flex-end"} mr={is488 ? 0 : 5} rowGap={2}>
          <Pagination
            size={is488 ? "medium" : "large"}
            page={page}
            onChange={(e, page) => setPage(page)}
            count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
            variant="outlined"
            shape="rounded"
          />
          <Typography textAlign="center">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, totalResults)} of {totalResults} results
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};














// import {
//   Button,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Pagination,
//   Select,
//   Stack,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from "@mui/material";
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Accordion from "@mui/material/Accordion";
// import AccordionSummary from "@mui/material/AccordionSummary";
// import AccordionDetails from "@mui/material/AccordionDetails";
// import AddIcon from "@mui/icons-material/Add";
// import { selectBrands } from "../../brands/BrandSlice";
// import FormGroup from "@mui/material/FormGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Checkbox from "@mui/material/Checkbox";
// import { selectCategories } from "../../categories/CategoriesSlice";
// import { ProductCard } from "../../products/components/ProductCard";
// import {
//   deleteProductByIdAsync,
//   fetchProductsAsync,
//   selectProductIsFilterOpen,
//   selectProductTotalResults,
//   selectProducts,
//   toggleFilters,
//   undeleteProductByIdAsync,
// } from "../../products/ProductSlice";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import ClearIcon from "@mui/icons-material/Clear";
// import { ITEMS_PER_PAGE } from "../../../constants";

// const sortOptions = [
//   { name: "Price: low to high", sort: "price", order: "asc" },
//   { name: "Price: high to low", sort: "price", order: "desc" },
// ];

// export const AdminDashBoard = () => {
//   const [filters, setFilters] = useState({});
//   const brands = useSelector(selectBrands);
//   const categories = useSelector(selectCategories);
//   const [sort, setSort] = useState(null);
//   const [page, setPage] = useState(1);
//   const products = useSelector(selectProducts);
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const is500 = useMediaQuery(theme.breakpoints.down(500));
//   const isProductFilterOpen = useSelector(selectProductIsFilterOpen);
//   const totalResults = useSelector(selectProductTotalResults);

//   const is1200 = useMediaQuery(theme.breakpoints.down(1200));
//   const is800 = useMediaQuery(theme.breakpoints.down(800));
//   const is700 = useMediaQuery(theme.breakpoints.down(700));
//   const is600 = useMediaQuery(theme.breakpoints.down(600));
//   const is488 = useMediaQuery(theme.breakpoints.down(488));

//   useEffect(() => {
//     setPage(1);
//   }, [totalResults]);

//   useEffect(() => {
//     const finalFilters = { ...filters };

//     finalFilters["pagination"] = { page: page, limit: ITEMS_PER_PAGE };
//     finalFilters["sort"] = sort;

//     dispatch(fetchProductsAsync(finalFilters));
//   }, [filters, sort, page]);

//   const handleBrandFilters = (e) => {
//     const filterSet = new Set(filters.brand);

//     if (e.target.checked) {
//       filterSet.add(e.target.value);
//     } else {
//       filterSet.delete(e.target.value);
//     }

//     const filterArray = Array.from(filterSet);
//     setFilters({ ...filters, brand: filterArray });
//   };

//   const handleCategoryFilters = (e) => {
//     const filterSet = new Set(filters.category);

//     if (e.target.checked) {
//       filterSet.add(e.target.value);
//     } else {
//       filterSet.delete(e.target.value);
//     }

//     const filterArray = Array.from(filterSet);
//     setFilters({ ...filters, category: filterArray });
//   };

//   const handleProductDelete = (productId) => {
//     dispatch(deleteProductByIdAsync(productId));
//   };

//   const handleProductUnDelete = (productId) => {
//     dispatch(undeleteProductByIdAsync(productId));
//   };

//   const handleFilterClose = () => {
//     dispatch(toggleFilters());
//   };

//   const getCategoryIdByName = (name) => {
//   const category = categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
//   return category?._id;
// };

//   return (
//     <>
//       <motion.div
//         style={{
//           position: "fixed",
//           backgroundColor: "white",
//           height: "100vh",
//           padding: "1rem",
//           overflowY: "scroll",
//           width: is500 ? "100vw" : "30rem",
//           zIndex: 500,
//         }}
//         variants={{ show: { left: 0 }, hide: { left: -500 } }}
//         initial={"hide"}
//         transition={{ ease: "easeInOut", duration: 0.7, type: "spring" }}
//         animate={isProductFilterOpen === true ? "show" : "hide"}
//       >
//         {/* fitlers section */}
//         <Stack
//           mb={"5rem"}
//           sx={{ scrollBehavior: "smooth", overflowY: "scroll" }}
//         >
//           <Typography variant="h4">New Arrivals</Typography>

//           <IconButton
//             onClick={handleFilterClose}
//             style={{ position: "absolute", top: 15, right: 15 }}
//           >
//             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//               <ClearIcon fontSize="medium" />
//             </motion.div>
//           </IconButton>

//           <Stack rowGap={2} mt={4}>
//             {[
//               "Totes",
//               "Backpacks",
//               "Travel Bags",
//               "Hip Bags",
//               "Laptop Sleeves",
//             ].map((catName) => (
//               <Typography
//                 key={catName}
//                 sx={{ cursor: "pointer" }}
//                 variant="body2"
//                 onClick={() =>
//                   setFilters({
//                     ...filters,
//                     category: [getCategoryIdByName(catName)],
//                   })
//                 }
//               >
//                 {catName}
//               </Typography>
//             ))}
//           </Stack>

//           {/* brand filters */}
//           <Stack mt={2}>
//             <Accordion>
//               <AccordionSummary
//                 expandIcon={<AddIcon />}
//                 aria-controls="brand-filters"
//                 id="brand-filters"
//               >
//                 <Typography>Brands</Typography>
//               </AccordionSummary>

//               <AccordionDetails sx={{ p: 0 }}>
//                 <FormGroup onChange={handleBrandFilters}>
//                   {brands?.map((brand) => (
//                     <motion.div
//                       style={{ width: "fit-content" }}
//                       whileHover={{ x: 5 }}
//                       whileTap={{ scale: 0.9 }}
//                     >
//                       <FormControlLabel
//                         sx={{ ml: 1 }}
//                         control={<Checkbox checked={filters.brand?.includes(brand._id) || false} whileHover={{ scale: 1.1 }} />}
//                         label={brand.name}
//                         value={brand._id}
//                       />
//                     </motion.div>
//                   ))}
//                 </FormGroup>
//               </AccordionDetails>
//             </Accordion>
//           </Stack>

//           {/* category filters */}
//           <Stack mt={2}>
//             <Accordion>
//               <AccordionSummary
//                 expandIcon={<AddIcon />}
//                 aria-controls="brand-filters"
//                 id="brand-filters"
//               >
//                 <Typography>Category</Typography>
//               </AccordionSummary>

//               <AccordionDetails sx={{ p: 0 }}>
//                 <FormGroup onChange={handleCategoryFilters}>
//                   {categories?.map((category) => (
//                     <motion.div
//                       style={{ width: "fit-content" }}
//                       whileHover={{ x: 5 }}
//                       whileTap={{ scale: 0.9 }}
//                     >
//                       <FormControlLabel
//                         sx={{ ml: 1 }}
//                         control={<Checkbox checked={filters.category?.includes(category._id) || false} whileHover={{ scale: 1.1 }} />}
//                         label={category.name}
//                         value={category._id}
//                       />
//                     </motion.div>
//                   ))}
//                 </FormGroup>
//               </AccordionDetails>
//             </Accordion>
//           </Stack>
//         </Stack>
//       </motion.div>

//       <Stack rowGap={5} mt={is600 ? 2 : 5} mb={"3rem"}>
//         {/* sort options */}
//         <Stack
//           flexDirection={"row"}
//           mr={"2rem"}
//           justifyContent={"flex-end"}
//           alignItems={"center"}
//           columnGap={5}
//         >
//           <Stack alignSelf={"flex-end"} width={"12rem"}>
//             <FormControl fullWidth>
//               <InputLabel id="sort-dropdown">Sort</InputLabel>
//               <Select
//                 variant="standard"
//                 labelId="sort-dropdown"
//                 label="Sort"
//                 onChange={(e) => setSort(e.target.value)}
//                 value={sort}
//               >
//                 <MenuItem bgcolor="text.secondary" value={null}>
//                   Reset
//                 </MenuItem>
//                 {sortOptions.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Stack>
//         </Stack>

//         <Grid
//           gap={2}
//           container
//           flex={1}
//           justifyContent={"center"}
//           alignContent={"center"}
//         >
//           {products.map((product) => (
//             <Stack>
//               <Stack sx={{ opacity: product.isDeleted ? 0.7 : 1 }}>
//                 <ProductCard
//                   key={product._id}
//                   id={product._id}
//                   title={product.title}
//                   thumbnail={product.thumbnail}
//                   brand={product.brand.name}
//                   price={product.price}
//                   isAdminCard={true}
//                 />
//               </Stack>
//               <Stack
//                 paddingLeft={2}
//                 paddingRight={2}
//                 flexDirection={"row"}
//                 justifySelf={"flex-end"}
//                 alignSelf={"flex-end"}
//                 columnGap={is488 ? 1 : 2}
//               >
//                 <Button
//                   component={Link}
//                   to={`/admin/product-update/${product._id}`}
//                   variant="contained"
//                 >
//                   Update
//                 </Button>
//                 {product.isDeleted === true ? (
//                   <Button
//                     onClick={() => handleProductUnDelete(product._id)}
//                     color="error"
//                     variant="outlined"
//                   >
//                     Un-delete
//                   </Button>
//                 ) : (
//                   <Button
//                     onClick={() => handleProductDelete(product._id)}
//                     color="error"
//                     variant="outlined"
//                   >
//                     Delete
//                   </Button>
//                 )}
//               </Stack>
//             </Stack>
//           ))}
//         </Grid>

//         <Stack
//           alignSelf={is488 ? "center" : "flex-end"}
//           mr={is488 ? 0 : 5}
//           rowGap={2}
//           p={is488 ? 1 : 0}
//         >
//           <Pagination
//             size={is488 ? "medium" : "large"}
//             page={page}
//             onChange={(e, page) => setPage(page)}
//             count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
//             variant="outlined"
//             shape="rounded"
//           />
//           <Typography textAlign={"center"}>
//             Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
//             {page * ITEMS_PER_PAGE > totalResults
//               ? totalResults
//               : page * ITEMS_PER_PAGE}{" "}
//             of {totalResults} results
//           </Typography>
//         </Stack>
//       </Stack>
//     </>
//   );
// };
