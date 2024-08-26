import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const order = await createOrder("123");
    const [orderItem] = order.items;

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find an order", async () => {
    const order = await createOrder("123");

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: "123" },
      include: ["items"],
    });

    const foundOrder = await orderRepository.find("123");
    const [orderItem] = foundOrder.items;

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: foundOrder.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find all orders", async () => {
    const orderRepository = new OrderRepository();
    const order = await createOrder("123");
    await orderRepository.create(order);

    const order2 = await createOrder("456");
    await orderRepository.create(order2);

    const foundOrders = await orderRepository.findAll();
    const orders = [order, order2];

    expect(orders).toEqual(foundOrders);
  });

  it("should update an order", async () => {
    const orderRepository = new OrderRepository();
    const order = await createOrder("123");

    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: "123" },
      include: ["items"],
    });

    expect(orderModel.total).toBe(20);
    expect(orderModel.items.map((i) => i.toJSON())).toStrictEqual([
      {
        id: "123",
        name: "Product 1",
        price: 10,
        quantity: 2,
        order_id: "123",
        product_id: "123",
      },
    ]);

    order.changeItens([
      new OrderItem("190", "new item", 200, "123", 1),
      new OrderItem("404", "item 2", 300, "123", 3),
    ]);

    await orderRepository.update(order);

    const updatedOrder = await OrderModel.findOne({
      where: { id: "123" },
      include: ["items"],
    });

    expect(updatedOrder.items.map((i) => i.toJSON())).toStrictEqual([
      {
        id: "190",
        name: "new item",
        price: 200,
        quantity: 1,
        order_id: "123",
        product_id: "123",
      },
      {
        id: "404",
        name: "item 2",
        price: 300,
        quantity: 3,
        order_id: "123",
        product_id: "123",
      },
    ]);
    expect(updatedOrder.total).toBe(1100);
  });

  async function createOrder(id: string): Promise<Order> {
    const customerRepository = new CustomerRepository();
    const customer = new Customer(id, "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product(id, "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      id,
      product.name,
      product.price,
      product.id,
      2
    );

    return new Order(id, id, [orderItem]);
  }
});
