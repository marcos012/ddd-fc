import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import AddressChangedEvent from "../address-changed.event";

export default class AddressChangedHandler
  implements EventHandlerInterface<AddressChangedEvent>
{
  handle({ eventData }: AddressChangedEvent): void {
    console.log(
      `Endereço do cliente: ${eventData.id}, ${
        eventData.name
      } alterado para: ${eventData.Address.toString()}`
    );
  }
}
