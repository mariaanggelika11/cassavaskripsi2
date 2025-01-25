import Product from "../models/OrderPanen.js";
import User from "../models/UserModel.js"; // Import model User
import Logistikdasar from "../models/DasarLogistik.js";
import TransaksiPR from "../models/TransaksiPerusahaan.js";
import Logistik from "../models/TransaksiLogistik.js";
import Perusahaan from "../models/DasarPerusahaan.js";
import Petani from "../models/RencanaTanam.js";
import TransaksiPBK from "../models/TransaksiPabrik.js";
import limbahpetani from "../models/LimbahPetani.js";
import Pabrik from "../models/DasarPabrik.js";
import TransaksiLogistik from "../models/TransaksiLogistik.js"; // Model transaksi logistik
import { Op } from "sequelize"; // Import operator Sequelize

const formatCurrency = (value) => value ? `Rp ${parseInt(value).toLocaleString("id-ID")}` : "-";
const formatWeight = (value) => value ? `${parseFloat(value).toLocaleString("id-ID")} kg` : "-";
const formatNumber = (value) => value ? parseFloat(value).toLocaleString("id-ID") : "-"; // Format number with a dot separator

export const searchById = async (req, res) => {
  try {
    const { uuid } = req.params; // Use uuid from params for searching

    // Query the product based on UUID
    const result = await Product.findOne({
      attributes: [
        "uuid",
        "idLahan",
        "tanggalPemanenan",
        "statusOrder",
        "varietasSingkong",
        "estimasiBerat",
        "estimasiHarga",
        "userId",
        "namaLogistik",
        "namaPerusahaan",
        "namaPabrik",
        "emailPerusahaan",
        "emailLogistik",
        "emailPabrik",
      ],
      where: {
        uuid, // Use UUID as the search criterion
      },
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: Logistik,
          attributes: [
            "orderPemanenUuid",
            "tanggalPengiriman",
            "waktuPengiriman",
            "estimasiWaktuTiba",
            "aktualWaktuTiba",
            "catatanEfisiensiRute",
            "biayaTransportasi",
            "kondisiPengiriman",
            "catatanDariPenerima",
          ],
          where: {
            orderPemanenUuid: uuid,
          },
          required: false,
        },
        {
          model: TransaksiPBK,
          attributes: [
            "orderPemanenUuid",
            "tanggalPenerimaan",
            "beratTotalDiterima",
            "catatanKualitas",
            "evaluasiKualitas",
          ],
          where: {
            orderPemanenUuid: uuid,
          },
          required: false,
        },
        {
          model: TransaksiPR,
          attributes: [
            "orderPemanenUuid",
            "hargaaktual",
            "catatanharga",
            "tanggalselesai",
          ],
          where: {
            orderPemanenUuid: uuid,
          },
          required: false,
        },
        {
          model: limbahpetani, // Corrected model name
          attributes: [
            "beratLimbahBatang",
            "catatanLimbahBatang",
            "beratLimbahDaun",
            "catatanLimbahDaun",
            "beratLimbahAkar",
            "catatanLimbahAkar",
          ],
          where: {
            orderPemanenUuid: uuid,
          },
          required: false,
        },
      ],
    });

    // If no product found, return an error
    if (!result) {
      return res.status(404).json({ msg: "Product not found." });
    }

    // Fetch land information based on idLahan
    const lahanInfo = await Petani.findOne({
      where: { idlahan: result.idLahan },
    });

    // If land info is not found
    if (!lahanInfo) {
      return res.status(404).json({ msg: "Land data not found." });
    }

    // Format data before returning the response
    const formattedResponse = {
      InformasiOrder: {
        ...result.toJSON(),
        estimasiHarga: formatCurrency(result.estimasiHarga),
        estimasiBerat: formatWeight(result.estimasiBerat),
      },
      LahanInfo: {
        ...lahanInfo.toJSON(),
        luaslahan: `${formatNumber(lahanInfo.luaslahan)} meter²`, // Adding luaslahan with dot separator
      },
    };

    // Format Logistik data
    if (formattedResponse.InformasiOrder.Logistik) {
      formattedResponse.InformasiOrder.Logistik.biayaTransportasi = formatCurrency(
        formattedResponse.InformasiOrder.Logistik.biayaTransportasi
      );
    }

    // Format TransaksiPR data
    if (formattedResponse.InformasiOrder.TransaksiPR) {
      formattedResponse.InformasiOrder.TransaksiPR.hargaaktual = formatCurrency(
        formattedResponse.InformasiOrder.TransaksiPR.hargaaktual
      );
    }

    // Format limbahpetani data
    if (formattedResponse.InformasiOrder.limbahpetani) {
      formattedResponse.InformasiOrder.limbahpetani.beratLimbahBatang = formatWeight(
        formattedResponse.InformasiOrder.limbahpetani.beratLimbahBatang
      );
      formattedResponse.InformasiOrder.limbahpetani.beratLimbahDaun = formatWeight(
        formattedResponse.InformasiOrder.limbahpetani.beratLimbahDaun
      );
      formattedResponse.InformasiOrder.limbahpetani.beratLimbahAkar = formatWeight(
        formattedResponse.InformasiOrder.limbahpetani.beratLimbahAkar
      );
    }

    // Send the final response
    res.status(200).json(formattedResponse);

  } catch (error) {
    // Server error handling
    res.status(500).json({ msg: "Server error: " + error.message });
  }
};
