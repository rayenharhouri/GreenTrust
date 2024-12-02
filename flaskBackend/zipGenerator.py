#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Sep 16 23:04:05 2024

@author: bunny
"""

from flask import Flask, request, jsonify
from datetime import datetime
from collections import defaultdict
import openpyxl

app = Flask(__name__)

def remove_duplicates(filtered_data):
    """
    Removes duplicates from the 'data' array within each 'filter' group based on the 'key' field.
    """
    for entry in filtered_data:
        unique_data = {}
        new_data = []
        for data_entry in entry['data']:
            key = data_entry['key']
            if key not in unique_data:
                unique_data[key] = data_entry
                new_data.append(data_entry)
        entry['data'] = new_data
    return filtered_data

template_path = r"/home/bunny/GreenTrust/backend/template.xlsm"
output_path = r"/home/bunny/Desktop/Nexus Resources/Nexus_Output/"

def group_by_cil_for_expedition(data_entries):
    """
    Groups data by CIL and sums the 'Potencia' and 'GarantiaSolicitada' for each company (CIL)
    only for use in the "EXPEDICION" sheet.
    """
    grouped_data = defaultdict(lambda: {
        'CIF': '', 'RazonSocial': '', 'CodigoPlanta': '', 'CIL': '', 'Potencia': 0, 'GarantiaSolicitada': 0, 
        'FechaInicio': '', 'FechaFin': ''
    })

    for entry in data_entries:
        cil = entry['CIL']

        # Initialize the entry the first time we encounter this CIL
        if grouped_data[cil]['CIF'] == '':
            grouped_data[cil].update({
                'CIF': entry['CIF'],
                'RazonSocial': entry['RazonSocial'],
                'CodigoPlanta': entry['CodigoPlanta'],
                'CIL': entry['CIL'],
                'FechaInicio': entry['FechaInicio'],
                'FechaFin': entry['FechaFin'],
            })
        
        # Sum Potencia and GarantiaSolicitada
        grouped_data[cil]['Potencia'] += float(entry['Potencia'])
        grouped_data[cil]['GarantiaSolicitada'] += float(entry['GarantiaSolicitada'])

        # Keep the earliest FechaInicio and latest FechaFin
        if float(entry['FechaInicio']) < float(grouped_data[cil]['FechaInicio']):
            grouped_data[cil]['FechaInicio'] = entry['FechaInicio']
        if float(entry['FechaFin']) > float(grouped_data[cil]['FechaFin']):
            grouped_data[cil]['FechaFin'] = entry['FechaFin']
    
    return list(grouped_data.values())

def fill_excel_from_data(filtered_data, template_path, output_path):
    """
    Fills an Excel sheet for each filter group based on the filtered data, grouping by CIL
    and summing values only for the EXPEDICION sheet.
    """
    for index, filter_group in enumerate(filtered_data):
        # Load the Excel template for each filter group
        workbook = openpyxl.load_workbook(template_path)
        
        # Common sheet fields
        sheet_common = workbook["Datos_Comunes"]
        today = datetime.today().strftime('%d/%m/%Y')
        
        # Fill in common fields (modify as needed)
        sheet_common["D21"].value = "Barcelone"
        sheet_common["F21"].value = today
        sheet_common["E11"].value = "42"
        sheet_common["C11"].value = "cosel de cent"
        sheet_common["G11"].value = "08014"
        sheet_common["H11"].value = "Barcelona"
        sheet_common["I11"].value = "Barcelona"
        sheet_common["J11"].value = "Espana"
        sheet_common["K11"].value = "932289972"
        sheet_common["L11"].value = "contratacionsolar@nexusenergia.com"

        # Get the filter and data for this group
        filter_info = filter_group['filter']
        data_entries = filter_group['data']
        
        ### PART 1: Grouped Data for "EXPEDICION" sheet ###
        # Group the data by CIL and sum 'Potencia' and 'GarantiaSolicitada'
        grouped_data = group_by_cil_for_expedition(data_entries)

        # Fill EXPEDICION sheet with the grouped data
        sheet_expedicion = workbook["EXPEDICION"]
        start_row = 14
        
        for entry in grouped_data:
            fecha_inicio = datetime.fromtimestamp(float(entry['FechaInicio']) / 1000)
            fecha_fin = datetime.fromtimestamp(float(entry['FechaFin']) / 1000)

            # Fill the data in the respective columns
            sheet_expedicion[f'A{start_row}'].value = entry['CIF']
            sheet_expedicion[f'B{start_row}'].value = entry['RazonSocial']
            sheet_expedicion[f'C{start_row}'].value = entry['CodigoPlanta']
            sheet_expedicion[f'D{start_row}'].value = entry['CIL']
            sheet_expedicion[f'E{start_row}'].value = float(entry['Potencia']) * 1000  # Convert to kW
            sheet_expedicion[f'F{start_row}'].value = fecha_inicio.strftime('%m-%Y')
            sheet_expedicion[f'G{start_row}'].value = fecha_fin.strftime('%m-%Y')
            sheet_expedicion[f'H{start_row}'].value = float(entry['GarantiaSolicitada']) / 1000  # Convert to thousands
            
            start_row += 1

        ### PART 2: Original Data for "Produccion_Mensual" sheet ###
        # Fill Produccion_Mensual sheet with the original data (not grouped)
        sheet_produccion = workbook["Produccion_Mensual"]
        start_row_prod = 12
        
        for entry in data_entries:
            sheet_produccion[f'A{start_row_prod}'].value = entry['CIL']
            sheet_produccion[f'B{start_row_prod}'].value = float(entry['GarantiaSolicitada']) / 1000  # Convert to thousands
            sheet_produccion[f'C{start_row_prod}'].value = str(entry['Mes']).zfill(2)
            sheet_produccion[f'D{start_row_prod}'].value = entry['Año']
            start_row_prod += 1

        # Save each filter group's Excel file
        output_filename = f"{output_path}/output_filter_{index + 1}.xlsx"
        workbook.save(output_filename)
        print(f"Excel file saved for filter {index + 1} at {output_filename}")


@app.route('/receive-data', methods=['POST'])
def receive_data():
    data = request.json

    # Remove duplicates
    filtered_data = remove_duplicates(data.get('filteredData', []))
    
    print('Filtered Data (After Removing Duplicates):', filtered_data)
    fill_excel_from_data(filtered_data,template_path,output_path)
    return jsonify({'status': 'success', 'message': 'Data received and duplicates removed successfully'}), 200


if __name__ == '__main__':
    app.run(port=5000)
