import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async update(entity: Order): Promise<void> {
    const transaction = await OrderModel.sequelize.transaction();

    const order = await OrderModel.findOne({
      where: { id: entity.id },
      include: ["items"],
      transaction,
    });

    for (const item of order.items) {
      if (!entity.items.map((i) => i.id).includes(item.id)) {
        await OrderItemModel.destroy({
          where: { id: item.id },
          transaction,
        });
      }
    }

    for (const item of entity.items) {
      await OrderItemModel.upsert(
        {
          id: item.id,
          order_id: entity.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        },
        { transaction }
      );
    }

    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: {
          id: entity.id,
        },
        transaction,
      }
    );

    await transaction.commit();
  }

  async find(id: string): Promise<Order> {
    const order = await OrderModel.findOne({
      where: { id },
      include: ["items"],
    });
    const orderItens = order.items.map(
      (item) =>
        new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        )
    );

    return new Order(order.id, order.customer_id, orderItens);
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: ["items"] });
    return orderModels.map(
      (order) =>
        new Order(
          order.id,
          order.customer_id,
          order.items.map<OrderItem>(
            (item) =>
              new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity
              )
          )
        )
    );
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}
