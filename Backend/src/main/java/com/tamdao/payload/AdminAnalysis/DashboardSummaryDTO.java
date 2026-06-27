package com.tamdao.payload.AdminAnalysis;


import com.tamdao.payload.dto.StoreDTO;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private Long totalStores;
    private Long activeStores;
    private Long blockedStores;
    private Long pendingStores;
    private List<StoreDTO> recentStoreActivity;
}
