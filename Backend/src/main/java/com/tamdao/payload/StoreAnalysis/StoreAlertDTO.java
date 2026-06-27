package com.tamdao.payload.StoreAnalysis;

import com.tamdao.payload.dto.BranchDTO;
import com.tamdao.payload.dto.ProductDTO;
import com.tamdao.payload.dto.RefundDTO;
import com.tamdao.payload.dto.UserDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StoreAlertDTO {
    private List<ProductDTO> lowStockAlerts;
    private List<BranchDTO> noSalesToday;
    private List<RefundDTO> refundSpikeAlerts;
    private List<UserDTO> inactiveCashiers;
}

