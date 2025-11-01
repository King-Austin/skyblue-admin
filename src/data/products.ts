export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Solar Panel 350W",
    shortDescription: "High-efficiency monocrystalline solar panel",
    fullDescription: "Generate clean, renewable energy with our premium 350W monocrystalline solar panel featuring advanced photovoltaic cells, durable aluminum frame, and weather-resistant construction. Perfect for residential and commercial installations with 25-year warranty and 21% efficiency rating.",
    price: 299.99,
    image: "/src/assets/product-solar-panel.jpg"
  },
  {
    id: "2",
    name: "Solar Power Bank Battery",
    shortDescription: "Portable solar battery storage with LCD display",
    fullDescription: "Store and access clean energy anywhere with our advanced solar power bank featuring 20,000mAh capacity, LCD display showing charge levels, multiple USB ports, and built-in solar panel for emergency charging. Water-resistant design perfect for outdoor adventures and backup power.",
    price: 249.99,
    image: "/src/assets/product-solar-battery.jpg"
  },
  {
    id: "3",
    name: "Solar Power Inverter 3kW",
    shortDescription: "Pure sine wave inverter with digital display",
    fullDescription: "Convert solar DC power to clean AC electricity with our professional-grade 3kW pure sine wave inverter. Features intelligent cooling system, digital LCD display, multiple protection systems, and 95% conversion efficiency. Perfect for home solar systems and off-grid applications.",
    price: 159.99,
    image: "/src/assets/product-solar-inverter.jpg"
  },
  {
    id: "4",
    name: "Solar Water Heater System",
    shortDescription: "Evacuated tube solar heating system",
    fullDescription: "Reduce energy costs with our high-efficiency solar water heater featuring evacuated tube technology, 200L capacity stainless steel tank, and weather-resistant construction. Provides hot water year-round with minimal maintenance. Perfect for residential use with 15-year warranty.",
    price: 129.99,
    image: "/src/assets/product-solar-heater.jpg"
  },
  {
    id: "5",
    name: "MPPT Solar Charge Controller",
    shortDescription: "Maximum power point tracking controller",
    fullDescription: "Optimize your solar system performance with this advanced MPPT charge controller featuring intelligent tracking algorithm, LCD display, multiple protection systems, and support for 12V/24V systems. Increases charging efficiency by up to 30% compared to PWM controllers.",
    price: 89.99,
    image: "/src/assets/product-solar-controller.jpg"
  },
  {
    id: "6",
    name: "Portable Solar Generator 2000W",
    shortDescription: "All-in-one solar power station",
    fullDescription: "Experience energy independence with our portable solar generator featuring 2000W capacity, multiple AC/DC outlets, USB ports, LCD display, and lithium battery technology. Includes carrying handle, solar panel input, and silent operation. Perfect for camping, emergencies, and off-grid living.",
    price: 179.99,
    image: "/src/assets/product-solar-generator.jpg"
  }
];
