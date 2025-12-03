import AddressService from "../service/address.service";

class AddressController {
  async create(req, res) {
    const address = await AddressService.createAddress(req.body);
    res.status(201).json(address);
  }

  async getByUser(req, res) {
    const { userId } = req.params;
    const addresses = await AddressService.getAddressesByUser(userId);
    res.status(200).json(addresses);
  }

  async update(req, res) {
    const { id } = req.params;
    const address = await AddressService.updateAddress(id, req.body);
    res.status(200).json(address);
  }

  async delete(req, res) {
    const { id } = req.params;
    await AddressService.deleteAddress(id);
    res.status(204).send();
  }
}

export default new AddressController();
