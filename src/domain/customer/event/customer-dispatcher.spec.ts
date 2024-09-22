import Customer from "../entity/customer";
import AddressChangedEvent from "./address-changed.event";
import CustomerCreatedEvent from "./customer-created.event";
import AddressChangedHandler from "./handler/log-when-address-is-changed";
import CustomerCreatedLog1Handler from "./handler/log-when-customer-is-created-1.handler";
import CustomerCreatedLog2Handler from "./handler/log-when-customer-is-created-2.handler";
import Address from "../value-object/address";
import EventDispatcher from "../../@shared/event/event-dispatcher";

describe("Customer dispatcher events", () => {
  it("should register on log event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new CustomerCreatedLog1Handler();
    const eventHandler2 = new CustomerCreatedLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandler);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandler2);
  });

  it("should register on address change event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const addressEventHandler = new AddressChangedHandler();

    eventDispatcher.register("AddressChangedEvent", addressEventHandler);

    expect(eventDispatcher.getEventHandlers["AddressChangedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["AddressChangedEvent"][0]
    ).toMatchObject(addressEventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new CustomerCreatedLog1Handler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("CustomerCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(0);
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new CustomerCreatedLog1Handler();
    const eventHandler2 = new CustomerCreatedLog2Handler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandler);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify CustomerCreated", () => {
    const eventDispatcher = new EventDispatcher();

    const eventHandler = new CustomerCreatedLog1Handler();
    const eventHandler2 = new CustomerCreatedLog2Handler();

    const spyEventHandler1 = jest.spyOn(eventHandler, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandler2);

    const customer = new Customer("c1", "Customer 1");
    const customerCreatedEvent = new CustomerCreatedEvent(customer);
    const customerCreatedEvent2 = new CustomerCreatedEvent(customer);

    eventDispatcher.notify(customerCreatedEvent);
    eventDispatcher.notify(customerCreatedEvent2);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
  });

  it("should notify AddressChanged", () => {
    const eventDispatcher = new EventDispatcher();

    const addressEventHandler = new AddressChangedHandler();

    const spyEventHandler3 = jest.spyOn(addressEventHandler, "handle");

    eventDispatcher.register("AddressChangedEvent", addressEventHandler);

    expect(
      eventDispatcher.getEventHandlers["AddressChangedEvent"][0]
    ).toMatchObject(addressEventHandler);

    const customer = new Customer("c1", "Customer 1");
    const address = new Address("Rua 1", 1, "12345-678", "Porto Alegre");

    customer.changeAddress(address);

    const customerAddressChangedEvent = new AddressChangedEvent(customer);

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyEventHandler3).toHaveBeenCalled();
  });
});
