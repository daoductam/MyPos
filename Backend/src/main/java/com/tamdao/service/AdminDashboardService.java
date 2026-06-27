package com.tamdao.service;



import com.tamdao.payload.AdminAnalysis.DashboardSummaryDTO;
import com.tamdao.payload.AdminAnalysis.StoreRegistrationStatDTO;
import com.tamdao.payload.AdminAnalysis.StoreStatusDistributionDTO;


import java.util.List;

public interface AdminDashboardService {

    DashboardSummaryDTO getDashboardSummary();

    List<StoreRegistrationStatDTO> getLast7DayRegistrationStats();

    StoreStatusDistributionDTO getStoreStatusDistribution();
}
